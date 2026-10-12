import { diag, metrics, trace, TraceFlags } from '@opentelemetry/api'
import type { Context, SpanContext } from '@opentelemetry/api'
import { logs } from '@opentelemetry/api-logs'
import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { BatchLogRecordProcessor, ConsoleLogRecordExporter, LoggerProvider } from '@opentelemetry/sdk-logs'
import { BatchSpanProcessor, ConsoleSpanExporter, SamplingDecision } from '@opentelemetry/sdk-trace-base'
import type { ReadableSpan, Sampler, Span, SpanProcessor } from '@opentelemetry/sdk-trace-base'
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node'
import { AzureMonitorLogExporter, AzureMonitorTraceExporter } from '@azure/monitor-opentelemetry-exporter'
import { defaultInstrumentations } from '@ministryofjustice/hmpps-azure-telemetry'
import * as Sentry from '@sentry/node'
import { SentrySampler, SentrySpanProcessor } from '@sentry/opentelemetry'

import { remoteSentrySampled, restartSentrySampling, SharedPropagator, upstreamW3cParent } from './sharedPropagator'
import { enrichName, keepSpan, telemetryConfig } from './telemetryConfig'
import { SharedTraceState } from './sharedTraceState'

/** Keep every App Insights request, including traces outside Sentry's sample. */
export function appInsightsSampler(sentrySampler: Sampler): Sampler {
  return {
    shouldSample: (...args) => {
      const [context, ...samplingArgs] = args
      const parent = trace.getSpan(context)
      const remoteParent = parent?.spanContext().isRemote
      const attributes = samplingArgs[3]
      // Sampling filtered roots out of Sentry also keeps their descendants out.
      const filteredRoot = !keepSpan({
        name: samplingArgs[1],
        kind: samplingArgs[2],
        attributes,
        durationMs: 0,
        status: { code: 0 },
      })
      const samplingContext =
        remoteParent && context.getValue(restartSentrySampling) ? trace.deleteSpan(context) : context
      // The SDK needs local state even for a fresh sampling decision. This
      // deferred virtual parent is passed only to the sampler, never the span
      // provider, so it does not become an exported parent.
      const localStateContext = trace.getSpanContext(samplingContext)
        ? samplingContext
        : trace.setSpanContext(samplingContext, {
            traceId: samplingArgs[0],
            spanId: '0000000000000001',
            traceFlags: TraceFlags.NONE,
            isRemote: true,
            traceState: new SharedTraceState().set('sentry.sampled_not_recording', '0'),
          })
      const result = sentrySampler.shouldSample(localStateContext, ...samplingArgs)
      const inherited = remoteParent ? context.getValue(remoteSentrySampled) : undefined
      let { decision } = result
      if (typeof inherited === 'boolean') {
        decision = inherited ? SamplingDecision.RECORD_AND_SAMPLED : SamplingDecision.NOT_RECORD
      }
      if (filteredRoot) decision = SamplingDecision.NOT_RECORD
      return {
        ...result,
        decision: decision === SamplingDecision.NOT_RECORD ? SamplingDecision.RECORD : decision,
      }
    },
    toString: () => `AppInsights(${sentrySampler.toString()})`,
  }
}

/** Apply the existing route names and exclusions once, before either exporter. */
export class SharedSpanProcessor implements SpanProcessor {
  private readonly azureParents = new WeakMap<ReadableSpan, SpanContext>()

  constructor(
    private readonly appInsights: SpanProcessor[],
    private readonly sentry: SpanProcessor,
  ) {}

  onStart(span: Span, parentContext: Context) {
    const w3cParent = parentContext.getValue(upstreamW3cParent) as SpanContext | undefined
    if (trace.getSpanContext(parentContext)?.isRemote && w3cParent) {
      this.azureParents.set(span as Span & ReadableSpan, w3cParent)
    }
    this.sentry.onStart(span, parentContext)
  }

  onEnding(span: Span) {
    const readable = span as Span & ReadableSpan
    enrichName({
      name: readable.name,
      kind: readable.kind,
      attributes: readable.attributes,
      updateName: name => span.updateName(name),
      setAttribute: (key, value) => span.setAttribute(key, value),
    })
  }

  onEnd(span: ReadableSpan) {
    if (
      !keepSpan({
        name: span.name,
        kind: span.kind,
        attributes: span.attributes,
        durationMs: span.duration[0] * 1000 + span.duration[1] / 1e6,
        status: span.status,
      })
    )
      return

    // BatchSpanProcessor drops RECORD_ONLY spans. Mark only the export copy as
    // sampled so App Insights receives every request; the original Sentry
    // sampling decision remains intact.
    const exportSpan: ReadableSpan = {
      ...span,
      attributes: Object.fromEntries(Object.entries(span.attributes).filter(([key]) => !key.startsWith('sentry.'))),
      ...(this.azureParents.has(span) ? { parentSpanContext: this.azureParents.get(span)! } : {}),
      duration: span.duration,
      ended: span.ended,
      droppedAttributesCount: span.droppedAttributesCount,
      droppedEventsCount: span.droppedEventsCount,
      droppedLinksCount: span.droppedLinksCount,
      spanContext: () => ({ ...span.spanContext(), traceFlags: TraceFlags.SAMPLED }),
    }
    this.appInsights.forEach(processor => processor.onEnd(exportSpan))
    if (span.spanContext().traceFlags === TraceFlags.SAMPLED) this.sentry.onEnd(span)
  }

  async forceFlush() {
    await settleTelemetry([...this.appInsights, this.sentry].map(processor => () => processor.forceFlush()))
  }

  async shutdown() {
    await this.forceFlush()
    await settleTelemetry([...this.appInsights, this.sentry].map(processor => () => processor.shutdown()))
  }
}

/** The telemetry library currently exposes no provider/processor configuration. */
export function startSharedTelemetry(client: Sentry.NodeClient) {
  const { connectionString, debug } = telemetryConfig
  const resource = resourceFromAttributes({
    'service.name': telemetryConfig.serviceName,
    'service.version': telemetryConfig.serviceVersion,
  })
  const appInsights: SpanProcessor[] = []
  const logProcessors: BatchLogRecordProcessor[] = []
  if (connectionString) {
    appInsights.push(new BatchSpanProcessor(new AzureMonitorTraceExporter({ connectionString })))
    // Retain the shared library's structural adapter for the Azure log SDK.
    const exporter = new AzureMonitorLogExporter({ connectionString })
    logProcessors.push(
      new BatchLogRecordProcessor({
        export: (records, callback) => exporter.export(records, callback),
        shutdown: () => exporter.shutdown(),
        forceFlush: async () => {
          if ('forceFlush' in exporter && typeof exporter.forceFlush === 'function') await exporter.forceFlush()
        },
      }),
    )
  }
  if (debug) {
    appInsights.push(new BatchSpanProcessor(new ConsoleSpanExporter()))
    logProcessors.push(new BatchLogRecordProcessor(new ConsoleLogRecordExporter()))
  }
  const provider = new NodeTracerProvider({
    resource,
    sampler: appInsightsSampler(new SentrySampler(client)),
    spanProcessors: [new SharedSpanProcessor(appInsights, new SentrySpanProcessor())],
  })
  provider.register({ contextManager: new Sentry.SentryContextManager(), propagator: new SharedPropagator() })
  const loggerProvider = new LoggerProvider({ resource, processors: logProcessors })
  logs.setGlobalLoggerProvider(loggerProvider)
  registerInstrumentations({
    tracerProvider: provider,
    meterProvider: metrics.getMeterProvider(),
    loggerProvider,
    instrumentations: defaultInstrumentations,
  })
  Sentry.validateOpenTelemetrySetup()

  return () => shutdownSharedTelemetry(provider, loggerProvider, () => Sentry.flush(2000))
}

type Flushable = { forceFlush(): Promise<void>; shutdown(): Promise<void> }

export async function shutdownSharedTelemetry(
  provider: Flushable,
  loggerProvider: Flushable,
  flushSentry: () => Promise<boolean>,
) {
  await settleTelemetry([() => provider.forceFlush(), () => loggerProvider.forceFlush()])
  await settleTelemetry([flushSentry])
  await settleTelemetry([() => provider.shutdown(), () => loggerProvider.shutdown()])
}

async function settleTelemetry(actions: (() => Promise<unknown>)[]) {
  const results = await Promise.allSettled(actions.map(async action => action()))
  results.forEach(result => {
    if (result.status === 'rejected') diag.error('Telemetry shutdown failed', result.reason)
  })
}

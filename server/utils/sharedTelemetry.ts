import { trace, TraceFlags } from '@opentelemetry/api'
import type { Context } from '@opentelemetry/api'
import { logs } from '@opentelemetry/api-logs'
import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { BatchLogRecordProcessor, ConsoleLogRecordExporter, LoggerProvider } from '@opentelemetry/sdk-logs'
import { BatchSpanProcessor, ConsoleSpanExporter, SamplingDecision } from '@opentelemetry/sdk-trace-base'
import type { ReadableSpan, Sampler, Span, SpanProcessor } from '@opentelemetry/sdk-trace-base'
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node'
import { AzureMonitorLogExporter, AzureMonitorTraceExporter } from '@azure/monitor-opentelemetry-exporter'
import { defaultInstrumentations, telemetry } from '@ministryofjustice/hmpps-azure-telemetry'
import * as Sentry from '@sentry/node'
import { SentrySampler, SentrySpanProcessor } from '@sentry/opentelemetry'

import { remoteSentrySampled, restartSentrySampling, SharedPropagator } from './sharedPropagator'

const keepSpan = telemetry.processors.filterSpanWherePath([
  '/health',
  '/ping',
  '/info',
  '/metrics',
  '/assets/*',
  '/favicon.ico',
])
const enrichName = telemetry.processors.enrichSpanNameWithHttpRoute()

/** Keep every App Insights request, including traces outside Sentry's sample. */
export function appInsightsSampler(sentrySampler: Sampler): Sampler {
  return {
    shouldSample: (...args) => {
      const [context, ...samplingArgs] = args
      const remoteParent = trace.getSpanContext(context)?.isRemote
      const samplingContext =
        remoteParent && context.getValue(restartSentrySampling) ? trace.deleteSpan(context) : context
      const result = sentrySampler.shouldSample(samplingContext, ...samplingArgs)
      const inherited = remoteParent ? context.getValue(remoteSentrySampled) : undefined
      let { decision } = result
      if (typeof inherited === 'boolean') {
        decision = inherited ? SamplingDecision.RECORD_AND_SAMPLED : SamplingDecision.NOT_RECORD
      }
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
  constructor(
    private readonly appInsights: SpanProcessor[],
    private readonly sentry: SpanProcessor,
  ) {}

  onStart(span: Span, parentContext: Context) {
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
    await Promise.all([...this.appInsights, this.sentry].map(processor => processor.forceFlush()))
  }

  async shutdown() {
    await this.forceFlush()
    await Promise.all([...this.appInsights, this.sentry].map(processor => processor.shutdown()))
  }
}

/** The telemetry library currently exposes no provider/processor configuration. */
export function startSharedTelemetry(client: Sentry.NodeClient) {
  const connectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING
  const debug = process.env['DEBUG_TELEMETRY'] === 'true'
  const resource = resourceFromAttributes({
    'service.name': 'hmpps-challenge-support-intervention-plan-ui',
    'service.version': process.env['BUILD_NUMBER'] || 'unknown',
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
        forceFlush: async () => {},
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
  registerInstrumentations({ tracerProvider: provider, loggerProvider, instrumentations: defaultInstrumentations })
  Sentry.validateOpenTelemetrySetup()

  return async () => {
    await provider.forceFlush()
    await Sentry.flush(2000)
    await Promise.all([provider.shutdown(), loggerProvider.shutdown()])
  }
}

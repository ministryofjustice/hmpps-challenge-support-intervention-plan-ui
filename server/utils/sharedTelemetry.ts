import { trace, TraceFlags } from '@opentelemetry/api'
import type { Context, SpanContext } from '@opentelemetry/api'
import { SamplingDecision } from '@opentelemetry/sdk-trace-base'
import type { ReadableSpan, Sampler, Span, SpanProcessor } from '@opentelemetry/sdk-trace-base'
import type { TelemetryBuilder } from '@ministryofjustice/hmpps-azure-telemetry'
import * as Sentry from '@sentry/node'
import { SentrySampler } from '@sentry/opentelemetry'

import { remoteSentrySampled, restartSentrySampling, SharedPropagator, upstreamW3cParent } from './sharedPropagator'
import { keepSpan } from './telemetryConfig'
import { SharedTraceState } from './sharedTraceState'
import { SampledSentrySpanProcessor } from './sampledSentrySpanProcessor'

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

/** Adapt only the Azure/debug export copy; the library owns its lifecycle. */
export class AppInsightsSpanProcessor implements SpanProcessor {
  private readonly azureParents = new WeakMap<ReadableSpan, SpanContext>()

  constructor(private readonly delegate: SpanProcessor) {}

  onStart(span: Span, parentContext: Context) {
    const w3cParent = parentContext.getValue(upstreamW3cParent) as SpanContext | undefined
    if (trace.getSpanContext(parentContext)?.isRemote && w3cParent) {
      this.azureParents.set(span as Span & ReadableSpan, w3cParent)
    }
    this.delegate.onStart(span, parentContext)
  }

  onEnding(span: Span) {
    this.delegate.onEnding?.(span)
  }

  onEnd(span: ReadableSpan) {
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
    this.delegate.onEnd(exportSpan)
  }

  forceFlush() {
    return this.delegate.forceFlush()
  }

  shutdown() {
    return this.delegate.shutdown()
  }
}

/** Sentry integration only; the telemetry library owns providers/exporters/logging. */
export function configureSentryTelemetry(builder: TelemetryBuilder, client: Sentry.NodeClient) {
  return builder.withProvider({
    sampler: appInsightsSampler(new SentrySampler(client)),
    contextManager: new Sentry.SentryContextManager(),
    propagator: new SharedPropagator(),
    extraSpanProcessors: [new SampledSentrySpanProcessor()],
    wrapExportProcessor: processor => new AppInsightsSpanProcessor(processor),
    afterFlush: () => Sentry.flush(2000),
  })
}

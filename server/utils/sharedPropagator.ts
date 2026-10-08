import { createContextKey, isSpanContextValid, trace, TraceFlags } from '@opentelemetry/api'
import type { Context, TextMapGetter, TextMapSetter, TraceState } from '@opentelemetry/api'
import { W3CBaggagePropagator, W3CTraceContextPropagator } from '@opentelemetry/core'
import { SentryPropagator } from '@sentry/opentelemetry'
import { SharedTraceState } from './sharedTraceState'

export const upstreamW3cSampled = createContextKey('csip.upstreamW3cSampled')
export const upstreamW3cParent = createContextKey('csip.upstreamW3cParent')

export const remoteSentrySampled = createContextKey('csip.remoteSentrySampled')
export const restartSentrySampling = createContextKey('csip.restartSentrySampling')

/** Preserve W3C correlation and full App Insights recording downstream. */
export class SharedPropagator extends SentryPropagator {
  private readonly baggage = new W3CBaggagePropagator()

  private readonly w3c = new W3CTraceContextPropagator()

  override inject(context: Context, carrier: unknown, setter: TextMapSetter) {
    let sentryHeaderWritten = false
    super.inject(context, carrier, {
      set: (target, key, value) => {
        if (key === 'sentry-trace') sentryHeaderWritten = true
        setter.set(target, key, value)
      },
    })
    const spanContext = trace.getSpanContext(context)
    // RECORD_ONLY spans are real, unsampled Sentry spans, rather than the
    // deferred/non-recording spans for which the SDK omits a sampling flag.
    if (sentryHeaderWritten && spanContext && trace.getSpan(context)?.isRecording()) {
      const sampled = spanContext.traceFlags === TraceFlags.SAMPLED ? '1' : '0'
      setter.set(carrier, 'sentry-trace', `${spanContext.traceId}-${spanContext.spanId}-${sampled}`)
    }
    const azureContext = spanContext
      ? trace.setSpanContext(context, {
          ...spanContext,
          traceFlags: context.getValue(upstreamW3cSampled) === false ? TraceFlags.NONE : TraceFlags.SAMPLED,
        })
      : context
    this.w3c.inject(azureContext, carrier, setter)
  }

  override extract(context: Context, carrier: unknown, getter: TextMapGetter) {
    let w3cContext = this.w3c.extract(context, carrier, getter)
    const w3cSpan = w3cContext !== context ? trace.getSpanContext(w3cContext) : undefined
    if (w3cSpan) {
      w3cContext = w3cContext
        .setValue(upstreamW3cSampled, w3cSpan.traceFlags === TraceFlags.SAMPLED)
        .setValue(upstreamW3cParent, w3cSpan)
    }
    const headerValue = getter.get(carrier, 'sentry-trace')
    const header = Array.isArray(headerValue) ? headerValue[0] : headerValue
    const match = typeof header === 'string' ? /^([\da-f]{32})-([\da-f]{16})(?:-([01]))?$/.exec(header) : null
    const validSentryHeader =
      match &&
      isSpanContextValid({
        traceId: match[1]!,
        spanId: match[2]!,
        traceFlags: TraceFlags.NONE,
      })

    if (w3cSpan && (!validSentryHeader || match[1] !== w3cSpan.traceId)) {
      // W3C sampling belongs to App Insights. Without a compatible Sentry
      // parent, use the configured Sentry rate and discard unrelated DSC.
      const filteredGetter: TextMapGetter = {
        keys: target => getter.keys(target),
        get: (target, key) => {
          if (key === 'sentry-trace') return undefined
          const value = getter.get(target, key)
          if (key !== 'baggage') return value
          const baggage = Array.isArray(value) ? value.join(',') : value
          return typeof baggage === 'string'
            ? baggage
                .split(',')
                .filter(entry => !entry.trim().startsWith('sentry-'))
                .join(',')
            : value
        },
      }
      return this.baggage
        .extract(super.extract(w3cContext, carrier, filteredGetter), carrier, filteredGetter)
        .setValue(restartSentrySampling, true)
    }

    let extracted = super.extract(w3cContext, carrier, getter)
    const sentrySpan = trace.getSpanContext(extracted)
    if (w3cSpan && sentrySpan) {
      // Sentry keeps its own upstream parent; the Azure export uses the W3C
      // parent saved on context. Local spans have one shared trace/span ID.
      extracted = trace.setSpanContext(extracted, {
        ...sentrySpan,
        traceId: w3cSpan.traceId,
        traceState: mergeTraceStates(w3cSpan.traceState, sentrySpan.traceState),
      })
    }
    if (validSentryHeader) {
      const span = trace.getSpanContext(extracted)!
      const baggageValue = getter.get(carrier, 'baggage')
      const baggageHeader = Array.isArray(baggageValue) ? baggageValue.join(',') : baggageValue
      const dsc = baggageHeader
        ?.split(',')
        .filter(entry => entry.trim().startsWith('sentry-'))
        .join(',')
      let state = mergeTraceStates(undefined, span.traceState)
      if (dsc) state = state.set('sentry.dsc', dsc)
      if (match[3] === '0') state = state.set('sentry.sampled_not_recording', '1')
      extracted = trace.setSpanContext(extracted, { ...span, traceState: state })
    }
    if (validSentryHeader && match[3] !== undefined) {
      // Keep this decision outside SDK tracestate internals, so a false
      // decision cannot be mistaken for deferred sampling by the SDK.
      extracted = extracted.setValue(remoteSentrySampled, match[3] === '1')
    }
    return this.baggage.extract(extracted, carrier, getter)
  }

  override fields() {
    return [...new Set([...super.fields(), ...this.w3c.fields()])]
  }
}

/** Merge vendor state without rebuilding Sentry's opaque SDK state. */
function mergeTraceStates(w3c: TraceState | undefined, sentry: TraceState | undefined): TraceState {
  const merged: TraceState = new SharedTraceState(
    w3c ?? sentry,
    new Map(
      ['sentry.dsc', 'sentry.sampled_not_recording', 'sentry.sample_rand', 'sentry.sample_rate'].flatMap(key => {
        const value = sentry?.get(key)
        return value === undefined ? [] : [[key, value] as [string, string]]
      }),
    ),
  )
  return merged
}

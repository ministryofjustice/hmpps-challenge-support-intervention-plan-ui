import { TraceFlags } from '@opentelemetry/api'
import type { ReadableSpan, Span } from '@opentelemetry/sdk-trace-base'
import { SentrySpanProcessor } from '@sentry/opentelemetry'

export class SampledSentrySpanProcessor extends SentrySpanProcessor {
  override onEnd(span: ReadableSpan) {
    if (span.spanContext().traceFlags === TraceFlags.SAMPLED) super.onEnd(span as Span & ReadableSpan)
  }
}

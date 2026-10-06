import { trace, TraceFlags } from '@opentelemetry/api'
import type { Context, TextMapGetter, TextMapSetter } from '@opentelemetry/api'
import { W3CTraceContextPropagator } from '@opentelemetry/core'
import { SentryPropagator } from '@sentry/opentelemetry'

/** Preserve W3C correlation and full App Insights recording downstream. */
export class SharedPropagator extends SentryPropagator {
  private readonly w3c = new W3CTraceContextPropagator()

  override inject(context: Context, carrier: unknown, setter: TextMapSetter) {
    super.inject(context, carrier, setter)
    const spanContext = trace.getSpanContext(context)
    const azureContext = spanContext
      ? trace.setSpanContext(context, { ...spanContext, traceFlags: TraceFlags.SAMPLED })
      : context
    this.w3c.inject(azureContext, carrier, setter)
  }

  override extract(context: Context, carrier: unknown, getter: TextMapGetter) {
    return super.extract(this.w3c.extract(context, carrier, getter), carrier, getter)
  }

  override fields() {
    return [...new Set([...super.fields(), ...this.w3c.fields()])]
  }
}

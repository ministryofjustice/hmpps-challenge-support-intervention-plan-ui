import { ROOT_CONTEXT, trace, TraceFlags } from '@opentelemetry/api'
import { SharedPropagator } from './sharedPropagator'

describe('shared telemetry propagation', () => {
  const traceId = '11111111111111111111111111111111'
  const spanId = '2222222222222222'
  const getter = {
    keys: (carrier: Record<string, string>) => Object.keys(carrier),
    get: (carrier: Record<string, string>, key: string) => carrier[key],
  }

  it('keeps downstream App Insights tracing sampled without changing the Sentry span context', () => {
    const context = trace.setSpanContext(ROOT_CONTEXT, {
      traceId,
      spanId,
      traceFlags: TraceFlags.NONE,
    })
    const carrier: Record<string, string> = {}
    new SharedPropagator().inject(context, carrier, {
      set: (target: Record<string, string>, key: string, value: string) => {
        Object.assign(target, { [key]: value })
      },
    })

    expect(carrier['traceparent']).toBe(`00-${traceId}-${spanId}-01`)
    expect(carrier['sentry-trace']).toBe(`${traceId}-${spanId}`)
    expect(trace.getSpanContext(context)?.traceFlags).toBe(TraceFlags.NONE)
  })

  it('continues an incoming W3C trace without a sentry-trace header', () => {
    const context = new SharedPropagator().extract(
      ROOT_CONTEXT,
      {
        traceparent: `00-${traceId}-${spanId}-01`,
      },
      getter,
    )

    expect(trace.getSpanContext(context)).toMatchObject({ traceId, spanId, isRemote: true })
  })
})

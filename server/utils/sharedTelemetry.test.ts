import { propagation, ROOT_CONTEXT, trace, TraceFlags } from '@opentelemetry/api'
import { suppressTracing } from '@opentelemetry/core'
import type { Span } from '@opentelemetry/api'
import { shutdownSharedTelemetry } from './sharedTelemetry'
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
        tracestate: 'vendor=value',
        baggage: 'tenant=example',
      },
      getter,
    )

    expect(trace.getSpanContext(context)).toMatchObject({ traceId, spanId, isRemote: true })
    expect(trace.getSpanContext(context)?.traceState?.serialize()).toBe('vendor=value')
    expect(propagation.getBaggage(context)?.getEntry('tenant')?.value).toBe('example')
  })

  it('preserves W3C parent and vendor metadata alongside matching Sentry headers', () => {
    const context = new SharedPropagator().extract(
      ROOT_CONTEXT,
      {
        traceparent: `00-${traceId}-${spanId}-01`,
        'sentry-trace': `${traceId}-3333333333333333-0`,
        tracestate: 'vendor=value',
        baggage: 'tenant=example',
      },
      getter,
    )
    expect(trace.getSpanContext(context)).toMatchObject({ traceId, spanId: '3333333333333333', isRemote: true })
    expect(trace.getSpanContext(context)?.traceState?.serialize()).toBe('vendor=value')
    expect(trace.getSpanContext(context)?.traceState?.get('sentry.sampled_not_recording')).toBe('1')
    expect(propagation.getBaggage(context)?.getEntry('tenant')?.value).toBe('example')
  })

  it('respects suppressed tracing', () => {
    const context = suppressTracing(
      trace.setSpanContext(ROOT_CONTEXT, { traceId, spanId, traceFlags: TraceFlags.SAMPLED }),
    )
    const carrier: Record<string, string> = {}
    new SharedPropagator().inject(context, carrier, {
      set: (target: Record<string, string>, key: string, value: string) => Object.assign(target, { [key]: value }),
    })
    expect(carrier).toEqual({})
  })

  it('preserves App Insights correlation when browser tracing headers disagree', () => {
    const context = new SharedPropagator().extract(
      ROOT_CONTEXT,
      {
        traceparent: `00-${traceId}-${spanId}-01`,
        'sentry-trace': '33333333333333333333333333333333-4444444444444444-1',
        baggage: 'sentry-trace_id=33333333333333333333333333333333,tenant=example',
      },
      getter,
    )
    expect(trace.getSpanContext(context)).toMatchObject({ traceId, spanId, isRemote: true })
    expect(propagation.getBaggage(context)?.getEntry('tenant')?.value).toBe('example')
    expect(propagation.getBaggage(context)?.getEntry('sentry-trace_id')).toBeUndefined()
  })

  it('propagates an explicitly unsampled Sentry decision for a recording App Insights span', () => {
    const context = trace.setSpan(ROOT_CONTEXT, {
      spanContext: () => ({ traceId, spanId, traceFlags: TraceFlags.NONE }),
      isRecording: () => true,
    } as Span)
    const carrier: Record<string, string> = {}
    new SharedPropagator().inject(context, carrier, {
      set: (target: Record<string, string>, key: string, value: string) => Object.assign(target, { [key]: value }),
    })
    expect(carrier['sentry-trace']).toBe(`${traceId}-${spanId}-0`)
    expect(carrier['traceparent']).toBe(`00-${traceId}-${spanId}-01`)
  })
})

describe('telemetry shutdown failures', () => {
  it('attempts every flush and shutdown even if each stage fails', async () => {
    const fail = () => jest.fn().mockRejectedValue(new Error('export unavailable'))
    const provider = { forceFlush: fail(), shutdown: fail() }
    const loggerProvider = { forceFlush: fail(), shutdown: fail() }
    const sentryFlush = fail()
    await expect(shutdownSharedTelemetry(provider, loggerProvider, sentryFlush)).resolves.toBeUndefined()
    ;[provider.forceFlush, provider.shutdown, loggerProvider.forceFlush, loggerProvider.shutdown, sentryFlush].forEach(
      action => expect(action).toHaveBeenCalledTimes(1),
    )
  })
})

import { createTraceState } from '@opentelemetry/api'
import type { TraceState } from '@opentelemetry/api'

/**
 * Sentry 10 uses dotted keys and comma-containing DSC values as local state.
 * OTel core 2.9 rejects these as W3C wire values. Keep SDK state locally while
 * serializing only valid W3C state, so sampling metadata survives SDK updates.
 */
export class SharedTraceState implements TraceState {
  constructor(
    private readonly wire: TraceState = createTraceState(),
    private readonly sentry: ReadonlyMap<string, string> = new Map(),
  ) {}

  get(key: string) {
    return key.startsWith('sentry.') ? this.sentry.get(key) : this.wire.get(key)
  }

  set(key: string, value: string): TraceState {
    if (!key.startsWith('sentry.')) return new SharedTraceState(this.wire.set(key, value), this.sentry)
    const sentry = new Map(this.sentry)
    sentry.set(key, value)
    return new SharedTraceState(this.wire, sentry)
  }

  unset(key: string): TraceState {
    const sentry = new Map(this.sentry)
    sentry.delete(key)
    return new SharedTraceState(this.wire.unset(key), sentry)
  }

  serialize() {
    return this.wire.serialize()
  }
}

import { flushTelemetry, initialiseTelemetry } from '@ministryofjustice/hmpps-azure-telemetry'
import * as Sentry from '@sentry/node'
import { sentryClient } from '../sentry'
import { configureSentryTelemetry } from './sharedTelemetry'
import { enrichName, keepSpan, telemetryConfig } from './telemetryConfig'

const builder = initialiseTelemetry(telemetryConfig).addFilter(keepSpan).addModifier(enrichName)

if (sentryClient) configureSentryTelemetry(builder, sentryClient)
builder.startRecording()
if (sentryClient) Sentry.validateOpenTelemetrySetup()

export const shutdownTelemetry = flushTelemetry

const shutdown = async (): Promise<void> => {
  try {
    await shutdownTelemetry()
  } finally {
    process.exit(0)
  }
}

process.on('SIGTERM', () => shutdown())
process.on('SIGINT', () => shutdown())

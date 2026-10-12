import { flushTelemetry, initialiseTelemetry } from '@ministryofjustice/hmpps-azure-telemetry'
import { sentryClient } from '../sentry'
import { startSharedTelemetry } from './sharedTelemetry'
import { enrichName, keepSpan, telemetryConfig } from './telemetryConfig'

const builder = initialiseTelemetry(telemetryConfig).addFilter(keepSpan).addModifier(enrichName)

export const shutdownTelemetry = sentryClient ? startSharedTelemetry(sentryClient) : flushTelemetry
if (!sentryClient) builder.startRecording()

const shutdown = async (): Promise<void> => {
  try {
    await shutdownTelemetry()
  } finally {
    process.exit(0)
  }
}

process.on('SIGTERM', () => shutdown())
process.on('SIGINT', () => shutdown())

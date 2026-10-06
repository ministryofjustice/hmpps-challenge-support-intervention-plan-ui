import { flushTelemetry, initialiseTelemetry, telemetry } from '@ministryofjustice/hmpps-azure-telemetry'
import { sentryClient } from '../sentry'
import { startSharedTelemetry } from './sharedTelemetry'

const builder = initialiseTelemetry({
  serviceName: 'hmpps-challenge-support-intervention-plan-ui',
  serviceVersion: process.env['BUILD_NUMBER'] || 'unknown',
  connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING,
  debug: process.env['DEBUG_TELEMETRY'] === 'true',
})
  .addFilter(
    telemetry.processors.filterSpanWherePath(['/health', '/ping', '/info', '/metrics', '/assets/*', '/favicon.ico']),
  )
  .addModifier(telemetry.processors.enrichSpanNameWithHttpRoute())

export const shutdownTelemetry = sentryClient ? startSharedTelemetry(sentryClient) : flushTelemetry
if (!sentryClient) builder.startRecording()

const shutdown = async (): Promise<void> => {
  await shutdownTelemetry()
  process.exit(0)
}

process.on('SIGTERM', () => shutdown())
process.on('SIGINT', () => shutdown())

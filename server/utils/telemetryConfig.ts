import { telemetry } from '@ministryofjustice/hmpps-azure-telemetry'

// Shared by the library-only and Sentry-enabled startup paths.
export const telemetryConfig = {
  serviceName: 'hmpps-challenge-support-intervention-plan-ui',
  serviceVersion: process.env['BUILD_NUMBER'] || 'unknown',
  connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING,
  debug: process.env['DEBUG_TELEMETRY'] === 'true',
}
export const keepSpan = telemetry.processors.filterSpanWherePath([
  '/health',
  '/ping',
  '/info',
  '/metrics',
  '/assets/*',
  '/favicon.ico',
])
export const enrichName = telemetry.processors.enrichSpanNameWithHttpRoute()

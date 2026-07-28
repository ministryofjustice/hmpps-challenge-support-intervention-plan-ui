import { flushTelemetry, initialiseTelemetry, telemetry } from '@ministryofjustice/hmpps-azure-telemetry'
import { RequestHandler } from 'express'

initialiseTelemetry({
  serviceName: 'hmpps-challenge-support-intervention-plan-ui',
  serviceVersion: process.env['BUILD_NUMBER'] || 'unknown',
  connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING,
  debug: process.env['DEBUG_TELEMETRY'] === 'true',
})
  .addFilter(
    telemetry.processors.filterSpanWherePath(['/health', '/ping', '/info', '/metrics', '/assets/*', '/favicon.ico']),
  )
  .addModifier(telemetry.processors.enrichSpanNameWithHttpRoute())
  .startRecording()

const shutdown = async (): Promise<void> => {
  await flushTelemetry()
  process.exit(0)
}

process.on('SIGTERM', () => shutdown())
process.on('SIGINT', () => shutdown())

export function telemetryMiddleware(): RequestHandler {
  return (_req, res, next) => {
    const { username, activeCaseLoad } = res.locals.user
    telemetry.setSpanAttributes({
      ...(username && { username }),
      ...(activeCaseLoad?.caseLoadId && { activeCaseLoadId: activeCaseLoad.caseLoadId }),
    })
    next()
  }
}

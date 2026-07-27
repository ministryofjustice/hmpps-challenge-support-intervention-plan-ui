import { defaultClient, DistributedTracingModes, setup, TelemetryClient } from 'applicationinsights'
import { trace } from '@opentelemetry/api'
import type { IncomingMessage } from 'node:http'
import { RequestHandler } from 'express'
import type { ApplicationInfo } from '../applicationInfo'

const ignoredRequestPaths = new Set(['/health', '/ping', '/metrics'])

export function isIgnoredAppInsightsRequest(request: Pick<IncomingMessage, 'url'>): boolean {
  const path = request.url?.split('?', 1)[0]
  return path !== undefined && ignoredRequestPaths.has(path)
}

export function initialiseAppInsights({ applicationName, buildNumber }: ApplicationInfo, overrideName?: string): void {
  if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
    // eslint-disable-next-line no-console
    console.log('Enabling azure application insights')

    const httpInstrumentationConfig = {
      enabled: true,
      ignoreIncomingRequestHook: isIgnoredAppInsightsRequest,
    }

    const configuration = setup()
    defaultClient.context.tags['ai.cloud.role'] = overrideName || applicationName
    defaultClient.context.tags['ai.application.ver'] = buildNumber
    configuration
      .setAzureMonitorOptions({
        instrumentationOptions: {
          http: httpInstrumentationConfig,
        },
      })
      .setDistributedTracingMode(DistributedTracingModes.AI_AND_W3C)
      .start()
  }
}

export function buildAppInsightsClient(): TelemetryClient | null {
  return process.env.APPLICATIONINSIGHTS_CONNECTION_STRING ? defaultClient : null
}

export function appInsightsMiddleware(): RequestHandler {
  return (req, res, next) => {
    const requestSpan = trace.getActiveSpan()

    res.prependOnceListener('finish', () => {
      if (requestSpan && req.route) {
        requestSpan.updateName(`${req.method} ${req.route.path}`)

        const { username, activeCaseLoad } = res.locals.user || {}
        if (username) {
          requestSpan.setAttribute('username', username)
        }
        if (activeCaseLoad?.caseLoadId) {
          requestSpan.setAttribute('activeCaseLoadId', activeCaseLoad.caseLoadId)
        }
      }
    })
    next()
  }
}

import {
  defaultClient,
  DistributedTracingModes,
  getCorrelationContext,
  setup,
  TelemetryClient,
} from 'applicationinsights'
import { RequestHandler } from 'express'
import { v4 } from 'uuid'
import type { ApplicationInfo } from '../applicationInfo'

export function initialiseAppInsights(): void {
  if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
    // eslint-disable-next-line no-console
    console.log('Enabling azure application insights')

    setup().setDistributedTracingMode(DistributedTracingModes.AI_AND_W3C).start()
  }
}

export function buildAppInsightsClient(
  { applicationName, buildNumber }: ApplicationInfo,
  overrideName?: string,
): TelemetryClient | null {
  if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
    defaultClient.context.tags['ai.cloud.role'] = overrideName || applicationName
    defaultClient.context.tags['ai.application.ver'] = buildNumber

    defaultClient.addTelemetryProcessor(({ data }) => {
      const { url } = data.baseData!
      return !url?.endsWith('/health') && !url?.endsWith('/ping') && !url?.endsWith('/metrics')
    })

    defaultClient.addTelemetryProcessor(({ tags, data }, contextObjects) => {
      const operationNameOverride =
        contextObjects?.['correlationContext']?.customProperties?.getProperty('operationName')
      if (operationNameOverride && tags) {
        // eslint-disable-next-line no-param-reassign
        tags['ai.operation.name'] = operationNameOverride
        if (data?.baseData) {
          // eslint-disable-next-line no-param-reassign
          data.baseData['name'] = operationNameOverride
        }
      }
      return true
    })

    return defaultClient
  }
  return null
}

export function appInsightsMiddleware(): RequestHandler {
  return (req, res, next) => {
    res.prependOnceListener('finish', () => {
      const context = getCorrelationContext()
      if (context && req.route) {
        context.customProperties.setProperty('operationName', `${req.method} ${req.route?.path}`)
        context.customProperties.setProperty('operationId', v4())
      }
    })
    next()
  }
}

import * as Sentry from '@sentry/node'
import config from './config'

export const sentryClient = config.sentry.dsn
  ? Sentry.init({
      dsn: config.sentry.dsn,
      environment: config.sentry.environment,
      tracesSampleRate: config.sentry.tracesSampleRate,
      skipOpenTelemetrySetup: true,
      // HTTP/Express spans come from the shared telemetry instrumentation. Keep
      // Sentry's error, request isolation and breadcrumb integrations.
      defaultIntegrations: Sentry.getDefaultIntegrationsWithoutPerformance(),
      integrations: [
        Sentry.httpIntegration({ spans: false, tracePropagation: false }),
        Sentry.nativeNodeFetchIntegration({ spans: false, tracePropagation: false }),
      ],
    })
  : undefined

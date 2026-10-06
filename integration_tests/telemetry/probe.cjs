/* eslint-disable global-require, import/no-dynamic-require, no-console */
// Conditional imports reproduce startup order; dynamic paths point to test builds.
// Run in a fresh process: OpenTelemetry instrumentation and providers are global.
const spans = []
const envelopes = []
const { ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-base')

ConsoleSpanExporter.prototype.export = (batch, callback) => {
  spans.push(...batch)
  callback({ code: 0 })
}

require('@ministryofjustice/hmpps-azure-telemetry')

const azureEnvelopes = []
// Intercept only the transport, so the real Azure exporter serializes requests and logs.
const { HttpSender } = require(
  require.resolve('@azure/monitor-opentelemetry-exporter').replace(/index\.js$/, 'platform/nodejs/httpSender.js'),
)
HttpSender.prototype.exportEnvelopes = async batch => {
  azureEnvelopes.push(...batch)
  return { code: 0 }
}
const Sentry = require('@sentry/node')

const originalInit = Sentry.init
Sentry.init = options =>
  originalInit({
    ...options,
    transport: () => ({
      send: async envelope => {
        envelopes.push(envelope)
        return { statusCode: 200 }
      },
      flush: async () => true,
    }),
  })

if (process.env.PROBE_MODE === 'fixed') {
  require(`${process.env.PROBE_BUILD_DIR}/utils/azureAppInsights.js`)
} else {
  require('@ministryofjustice/hmpps-azure-telemetry')
    .initialiseTelemetry({ serviceName: 'telemetry-probe', debug: process.env.DEBUG_TELEMETRY === 'true' })
    .startRecording()
}

const http = require('http')
const express = require('express')

const downstreamHeaders = []
const dependency = http.createServer((req, res) => {
  downstreamHeaders.push(req.headers)
  res.end('ok')
})
dependency.listen(0, '127.0.0.1')

if (process.env.PROBE_MODE === 'original')
  Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE) })
const userTelemetry = require(`${process.env.PROBE_BUILD_DIR}/middleware/userTelemetry.js`).default
const app = express()
const bunyanModule = require('bunyan')

const bunyan = bunyanModule.default || bunyanModule
const rawLogs = []
const logger = bunyan.createLogger({
  name: 'telemetry-probe',
  streams: [{ type: 'raw', stream: { write: record => rawLogs.push(record) }, level: 'info' }],
})
logger.info('TELEMETRY_LOG_PROBE')
app.use((req, res, next) => {
  res.locals.user = {
    username: req.path === '/first' ? 'USER1' : 'USER2',
    userId: '123',
    userUuid: '11111111-1111-1111-1111-111111111111',
    authSource: 'nomis',
    activeCaseLoadId: 'MDI',
  }
  Sentry.setUser({ id: res.locals.user.username })
  next()
})
app.use(userTelemetry())
app.get('/first', async (_req, res) => {
  await new Promise(resolve => {
    setTimeout(resolve, 25)
  })
  await new Promise((resolve, reject) => {
    http
      .get(`http://127.0.0.1:${dependency.address().port}/health`, response => {
        response.resume()
        response.on('end', resolve)
      })
      .on('error', reject)
  })
  logger.info('TELEMETRY_REQUEST_LOG_PROBE')
  if (process.env.SENTRY_DSN) Sentry.captureException(new Error('FIRST_ERROR_PROBE'))
  res.send('ok')
})
app.get('/health', (_req, res) => res.send('healthy'))
app.get('/assets/probe.js', (_req, res) => res.send('asset'))
app.get('/second', () => {
  throw new Error('TELEMETRY_ERROR_PROBE')
})
if (process.env.SENTRY_DSN) Sentry.setupExpressErrorHandler(app)
app.use((err, _req, res, _next) => res.status(500).send(err.message))

const server = app.listen(0, '127.0.0.1', async () => {
  try {
    const base = `http://127.0.0.1:${server.address().port}`
    await Promise.all(
      ['/first', '/second', '/health', '/assets/probe.js'].map(async path => {
        const parentCase = process.env.PROBE_PARENT_CASE
        const traceId = '11111111111111111111111111111111'
        const spanId = '2222222222222222'
        const headers = parentCase
          ? {
              traceparent: `00-${traceId}-${spanId}-01`,
              'sentry-trace':
                parentCase === 'conflict'
                  ? '33333333333333333333333333333333-4444444444444444-1'
                  : `${traceId}-${spanId}-${parentCase}`,
            }
          : {}
        const response = await fetch(base + path, { headers })
        await response.text()
      }),
    )
    server.closeAllConnections()
    await new Promise(resolve => {
      server.close(resolve)
    })
    dependency.closeAllConnections()
    await new Promise(resolve => {
      dependency.close(resolve)
    })
    const globalProvider = require('@opentelemetry/api').trace.getTracerProvider()
    const provider = globalProvider.getDelegate ? globalProvider.getDelegate() : globalProvider
    // The shared implementation must flush through its own shutdown path.
    // The legacy library needs its delegate flushed to observe the control.
    const shared = process.env.PROBE_MODE === 'fixed' && process.env.SENTRY_DSN
    if (!shared && provider.forceFlush) await provider.forceFlush()
    if (process.env.PROBE_MODE === 'fixed') {
      await require(`${process.env.PROBE_BUILD_DIR}/utils/azureAppInsights.js`).shutdownTelemetry()
    } else {
      await require('@ministryofjustice/hmpps-azure-telemetry').flushTelemetry()
    }
    if (!shared) await Sentry.flush(2000)
    console.log(
      `PROBE_RESULT=${JSON.stringify({
        azureRequests: azureEnvelopes
          .filter(envelope => envelope.data.baseType === 'RequestData')
          .map(envelope => envelope.data.baseData),
        azureMessages: azureEnvelopes
          .filter(envelope => envelope.data.baseType === 'MessageData')
          .map(envelope => envelope.data.baseData.message),
        rawLogCount: rawLogs.length,
        downstreamHeaders,
        azureRequestLogs: azureEnvelopes
          .filter(envelope => envelope.data.baseType === 'MessageData')
          .map(envelope => ({ message: envelope.data.baseData.message, traceId: envelope.tags['ai.operation.id'] })),
        requests: spans
          .filter(span => span.kind === 1)
          .map(span => ({
            name: span.name,
            attributes: span.attributes,
            duration: span.duration,
            traceId: span.spanContext().traceId,
          })),
        events: envelopes
          .flatMap(envelope => envelope[1])
          .filter(item => ['event', 'transaction'].includes(item[0].type))
          .map(item => ({
            type: item[0].type,
            user: item[1].user,
            traceId: item[1].contexts && item[1].contexts.trace && item[1].contexts.trace.trace_id,
            message: item[1].exception && item[1].exception.values[0].value,
          })),
      })}`,
    )
    process.exit(0)
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
})

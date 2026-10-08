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
  return { code: process.env.PROBE_FAIL_EXPORT === 'true' ? 1 : 0 }
}
let azureLogFlushes = 0
const { AzureMonitorLogExporter } = require('@azure/monitor-opentelemetry-exporter')
// Exercise the library-compatible adapter when an exporter exposes forceFlush.
AzureMonitorLogExporter.prototype.forceFlush = async () => {
  azureLogFlushes += 1
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
      flush: async () => {
        if (process.env.PROBE_SIGNAL === 'true') console.log('PROBE_SENTRY_FLUSH')
        return true
      },
    }),
  })

if (process.env.PROBE_MODE === 'fixed') {
  require(`${process.env.PROBE_BUILD_DIR}/utils/azureAppInsights.js`)
} else {
  require('@ministryofjustice/hmpps-azure-telemetry')
    .initialiseTelemetry({ serviceName: 'telemetry-probe', debug: process.env.DEBUG_TELEMETRY === 'true' })
    .startRecording()
}

const httpInstrumentation = require('@ministryofjustice/hmpps-azure-telemetry').defaultInstrumentations.find(
  instrumentation => instrumentation.instrumentationName === '@opentelemetry/instrumentation-http',
)
// The dependency fixture represents a remote service, outside CSIP telemetry.
httpInstrumentation.setConfig({
  ...httpInstrumentation.getConfig(),
  ignoreIncomingRequestHook: req => ['/dependency', '/probe-dependency'].includes(req.url),
})
const sentryStarted = []
if (Sentry.getClient())
  Sentry.getClient().on('spanStart', span => {
    sentryStarted.push({ url: span.attributes['http.url'], flags: span.spanContext().traceFlags })
  })
const http = require('http')
const express = require('express')

const downstreamHeaders = []
const dependency = http.createServer((req, res) => {
  if (req.url === '/dependency') downstreamHeaders.push(req.headers)
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
      .get(`http://127.0.0.1:${dependency.address().port}/dependency`, response => {
        response.resume()
        response.on('end', resolve)
      })
      .on('error', reject)
  })
  logger.info('TELEMETRY_REQUEST_LOG_PROBE')
  if (process.env.SENTRY_DSN) Sentry.captureException(new Error('FIRST_ERROR_PROBE'))
  res.send('ok')
})
app.get('/health', (_req, res) => {
  http
    .get(`http://127.0.0.1:${dependency.address().port}/probe-dependency`, response => {
      response.resume()
      response.on('end', () => res.send('healthy'))
    })
    .on('error', error => res.status(500).send(error.message))
})
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
          ? { traceparent: `00-${traceId}-${spanId}-${parentCase === 'w3c-unsampled' ? '00' : '01'}` }
          : {}
        if (parentCase && !parentCase.startsWith('w3c')) {
          headers['sentry-trace'] =
            parentCase === 'conflict'
              ? '33333333333333333333333333333333-4444444444444444-1'
              : `${traceId}-${parentCase === 'parents' ? '3333333333333333' : spanId}-${parentCase === 'parents' ? '1' : parentCase}`
        }
        if (parentCase === 'invalid') headers['sentry-trace'] = 'invalid'
        if (parentCase === 'parents') {
          headers.tracestate = 'vendor=value'
          headers.baggage = `sentry-trace_id=${traceId},sentry-public_key=upstream,sentry-sample_rate=0.2,sentry-sample_rand=0.123,tenant=example`
        }
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
    if (process.env.PROBE_SIGNAL === 'true') {
      process.emit('SIGTERM')
      return
    }
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
        azureRequestParents: azureEnvelopes
          .filter(envelope => envelope.data.baseType === 'RequestData')
          .map(envelope => ({ name: envelope.data.baseData.name, parent: envelope.tags['ai.operation.parentId'] })),
        azureDimensions: azureEnvelopes
          .filter(envelope => ['RequestData', 'RemoteDependencyData'].includes(envelope.data.baseType))
          .map(envelope => envelope.data.baseData.properties),
        azureMessages: azureEnvelopes
          .filter(envelope => envelope.data.baseType === 'MessageData')
          .map(envelope => envelope.data.baseData.message),
        rawLogCount: rawLogs.length,
        azureLogFlushes,
        downstreamHeaders,
        sentryStarted,
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
            parentSpanId: item[1].contexts && item[1].contexts.trace && item[1].contexts.trace.parent_span_id,
            transaction: item[1].transaction,
            dsc: envelopes.find(envelope => envelope[1].includes(item))[0].trace,
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

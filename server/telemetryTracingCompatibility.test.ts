import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { buildSync } from 'esbuild'

type ProbeResult = {
  azureRequests: { name: string; properties: Record<string, unknown>; duration: string }[]
  azureRequestParents: { name: string; parent?: string }[]
  azureDimensions: Record<string, unknown>[]
  azureMessages: string[]
  rawLogCount: number
  azureLogFlushes: number
  sentryStarted: { url: string; flags: number }[]
  downstreamHeaders: Record<string, string>[]
  azureRequestLogs: { message: string; traceId?: string }[]
  requests: { name: string; attributes: Record<string, unknown>; duration: number[]; traceId: string }[]
  events: {
    type: string
    user?: { id: string }
    message?: string
    traceId?: string
    parentSpanId?: string
    transaction?: string
    dsc?: Record<string, string>
  }[]
}

describe('shared App Insights and Sentry tracing', () => {
  let buildDir: string

  beforeAll(() => {
    buildDir = mkdtempSync(path.join(tmpdir(), 'csip-telemetry-'))
    buildSync({
      entryPoints: ['server/utils/azureAppInsights.ts', 'server/middleware/userTelemetry.ts'],
      bundle: true,
      packages: 'external',
      platform: 'node',
      format: 'cjs',
      outdir: buildDir,
    })
  })

  afterAll(() => rmSync(buildDir, { recursive: true, force: true }))

  function runProbe(
    mode: 'original' | 'fixed',
    sampleRate: string,
    dsn = 'https://public@127.0.0.1/1',
    parentCase = '',
    debug = true,
    failExport = false,
    signal = false,
  ): string {
    return execFileSync(process.execPath, ['integration_tests/telemetry/probe.cjs'], {
      encoding: 'utf8',
      timeout: 30000,
      env: {
        ...process.env,
        NODE_ENV: 'test',
        NODE_PATH: path.resolve('node_modules'),
        APPLICATIONINSIGHTS_CONNECTION_STRING:
          mode === 'fixed'
            ? 'InstrumentationKey=00000000-0000-0000-0000-000000000001;IngestionEndpoint=http://127.0.0.1'
            : '',
        APPLICATION_INSIGHTS_NO_STATSBEAT: 'true',
        DEBUG_TELEMETRY: String(debug),
        SENTRY_DSN: dsn,
        SENTRY_TRACES_SAMPLE_RATE: sampleRate,
        PROBE_MODE: mode,
        PROBE_PARENT_CASE: parentCase,
        PROBE_FAIL_EXPORT: String(failExport),
        PROBE_SIGNAL: String(signal),
        PROBE_BUILD_DIR: buildDir,
      },
    })
  }

  function probe(...args: Parameters<typeof runProbe>): ProbeResult {
    const output = runProbe(...args)
    const result = output.split('\n').find(line => line.startsWith('PROBE_RESULT='))
    expect(result).toBeDefined()
    return JSON.parse(result!.slice('PROBE_RESULT='.length))
  }

  function expectUserRequests(result: ProbeResult) {
    expect(result.azureRequests).toHaveLength(2)
    result.azureRequests.forEach(request => {
      expect(request.properties).toMatchObject({
        username: request.name === 'GET /first' ? 'USER1' : 'USER2',
        userId: '123',
        userUuid: '11111111-1111-1111-1111-111111111111',
        activeCaseLoadId: 'MDI',
      })
      expect(request.duration).toEqual(expect.any(String))
    })
    expect(result.azureMessages).toContain('TELEMETRY_LOG_PROBE')
    expect(result.rawLogCount).toBe(2)
    expect(result.azureLogFlushes).toBeGreaterThan(0)
    expect(result.azureRequestLogs).toContainEqual({
      message: 'TELEMETRY_REQUEST_LOG_PROBE',
      traceId: result.requests.find(request => request.name === 'GET /first')?.traceId,
    })
    expect(result.requests).toHaveLength(2)
    expect(result.requests.map(request => request.name).sort()).toEqual(['GET /first', 'GET /second'])
    result.requests.forEach(request => {
      expect(request.attributes).toMatchObject({
        username: request.name === 'GET /first' ? 'USER1' : 'USER2',
        userId: '123',
        userUuid: '11111111-1111-1111-1111-111111111111',
        activeCaseLoadId: 'MDI',
      })
      expect(request.duration).toHaveLength(2)
      expect(Object.keys(request.attributes).filter(key => key.startsWith('sentry.'))).toEqual([])
    })
  }

  function expectErrors(result: ProbeResult) {
    const errors = result.events.filter(event => event.type === 'event')
    expect(errors).toHaveLength(2)
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ message: 'FIRST_ERROR_PROBE', user: { id: 'USER1' } }),
        expect.objectContaining({ message: 'TELEMETRY_ERROR_PROBE', user: { id: 'USER2' } }),
      ]),
    )
    errors.forEach(error => {
      const request = result.requests.find(item => item.attributes['username'] === error.user?.id)
      expect(error.traceId).toBe(request?.traceId)
    })
  }

  it('reproduces duplicate server spans with the previous Sentry setup', () => {
    const result = probe('original', '1')
    const requests = result.requests.filter(request =>
      ['/first', '/second'].includes(String(request.attributes['http.target'])),
    )
    expect(requests).toHaveLength(4)
    expect(requests.filter(request => request.attributes['sentry.op'])).toHaveLength(2)
    expect(requests.filter(request => request.attributes['username'])).toHaveLength(2)
  }, 35000)

  it('exports one enriched request to App Insights, preserves Sentry performance and isolates errors', () => {
    const result = probe('fixed', '1')
    expectUserRequests(result)
    expectErrors(result)
    expect(result.events.filter(event => event.type === 'transaction')).toHaveLength(2)
    const healthDependencies = result.sentryStarted.filter(span => span.url?.endsWith('/probe-dependency'))
    expect(healthDependencies).toHaveLength(1)
    expect(healthDependencies[0]?.flags).toBe(0)
  }, 35000)

  it('retains all App Insights requests and error reports outside the Sentry performance sample', () => {
    const result = probe('fixed', '0')
    expectUserRequests(result)
    expectErrors(result)
    expect(result.events.filter(event => event.type === 'transaction')).toHaveLength(0)
  }, 35000)

  it.each([
    ['1', '0', 0],
    ['0', '1', 2],
    ['0', 'conflict', 0],
    ['0', 'w3c-only', 0],
    ['1', 'w3c-only', 2],
    ['0', 'invalid', 0],
  ])(
    'preserves W3C correlation and Sentry sampling (rate %s, incoming %s)',
    (rate, parentCase, transactions) => {
      const result = probe('fixed', String(rate), undefined, String(parentCase))
      expectUserRequests(result)
      expectErrors(result)
      expect(result.events.filter(event => event.type === 'transaction')).toHaveLength(Number(transactions))
      result.requests.forEach(request => expect(request.traceId).toBe('11111111111111111111111111111111'))
      expect(result.downstreamHeaders).toHaveLength(1)
      const headers = result.downstreamHeaders[0]!
      expect(headers['traceparent']).toMatch(/^00-11111111111111111111111111111111-[a-f0-9]{16}-01$/)
      expect(headers['sentry-trace']).toMatch(
        new RegExp(`^11111111111111111111111111111111-[a-f0-9]{16}-${transactions ? '1' : '0'}$`),
      )
    },
    35000,
  )

  it('preserves an upstream W3C unsampled decision downstream without suppressing CSIP user telemetry', () => {
    const result = probe('fixed', '1', undefined, 'w3c-unsampled')
    expectUserRequests(result)
    expectErrors(result)
    expect(result.downstreamHeaders[0]?.['traceparent']).toMatch(/-00$/)
    expect(result.events.filter(event => event.type === 'transaction')).toHaveLength(2)
  }, 35000)

  it('keeps independent upstream parents and Sentry DSC alongside vendor tracestate', () => {
    const result = probe('fixed', '0', undefined, 'parents')
    expectUserRequests(result)
    const transactions = result.events.filter(event => event.type === 'transaction')
    expect(transactions).toHaveLength(2)
    transactions.forEach(transaction => {
      expect(transaction.parentSpanId).toBe('3333333333333333')
      expect(transaction.dsc).toMatchObject({ public_key: 'upstream', sample_rate: '0.2', sample_rand: '0.123' })
    })
    result.azureRequestParents.forEach(request => expect(request.parent).toBe('2222222222222222'))
    expect(result.downstreamHeaders[0]?.['tracestate']).toBe('vendor=value')
    expect(result.downstreamHeaders[0]?.['baggage']).toContain('tenant=example')
    result.azureDimensions.forEach(dimensions =>
      expect(Object.keys(dimensions).filter(key => key.startsWith('sentry.'))).toEqual([]),
    )
  }, 35000)

  it('flushes Sentry errors and shuts down even when the Azure export fails', () => {
    const result = probe('fixed', '1', undefined, '', true, true)
    expectErrors(result)
    expect(result.events.filter(event => event.type === 'transaction')).toHaveLength(2)
  }, 35000)

  it('exits cleanly after SIGTERM and still flushes Sentry when Azure export fails', () => {
    // execFileSync also asserts exit code zero; timeout catches a stuck pod.
    expect(runProbe('fixed', '1', undefined, '', true, true, true)).toContain('PROBE_SENTRY_FLUSH')
  }, 35000)

  it('exports enriched requests and errors with debug exporters disabled, as in production', () => {
    const result = probe('fixed', '0', undefined, '', false)
    expect(result.requests).toEqual([])
    expect(result.azureRequests).toHaveLength(2)
    result.azureRequests.forEach(request => {
      expect(request.properties).toMatchObject({
        username: request.name === 'GET /first' ? 'USER1' : 'USER2',
        userUuid: '11111111-1111-1111-1111-111111111111',
        activeCaseLoadId: 'MDI',
      })
    })
    expect(result.events.filter(event => event.type === 'event')).toHaveLength(2)
    expect(result.events.filter(event => event.type === 'transaction')).toHaveLength(0)
    expect(result.azureMessages).toContain('TELEMETRY_REQUEST_LOG_PROBE')
  }, 35000)

  it('records user attributes when Sentry is not configured', () => {
    const result = probe('fixed', '1', '')
    expectUserRequests(result)
    expect(result.events).toEqual([])
  }, 35000)
})

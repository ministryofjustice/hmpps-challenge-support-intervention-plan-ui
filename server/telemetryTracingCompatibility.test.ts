import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { buildSync } from 'esbuild'

type ProbeResult = {
  azureRequests: { name: string; properties: Record<string, unknown>; duration: string }[]
  azureMessages: string[]
  rawLogCount: number
  downstreamHeaders: Record<string, string>[]
  azureRequestLogs: { message: string; traceId?: string }[]
  requests: { name: string; attributes: Record<string, unknown>; duration: number[]; traceId: string }[]
  events: { type: string; user?: { id: string }; message?: string; traceId?: string }[]
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

  function probe(
    mode: 'original' | 'fixed',
    sampleRate: string,
    dsn = 'https://public@127.0.0.1/1',
    parentCase = '',
    debug = true,
  ): ProbeResult {
    const output = execFileSync(process.execPath, ['integration_tests/telemetry/probe.cjs'], {
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
        PROBE_BUILD_DIR: buildDir,
      },
    })
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
      expect(request.attributes['sentry.op']).toBeUndefined()
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

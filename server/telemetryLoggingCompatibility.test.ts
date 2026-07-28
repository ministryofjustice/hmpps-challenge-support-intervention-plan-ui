import { execFileSync } from 'node:child_process'

describe('telemetry logging compatibility', () => {
  it('captures Bunyan-compatible logs with the shared telemetry instrumentation', () => {
    const script = `
      const telemetry = require('@ministryofjustice/hmpps-azure-telemetry')
      telemetry
        .initialiseTelemetry({
          serviceName: 'bunyan-compatibility-test',
          serviceVersion: 'test',
          debug: true,
        })
        .startRecording()

      const bunyanModule = require('bunyan')
      const bunyan = bunyanModule.default || bunyanModule
      const records = []
      const logger = bunyan.createLogger({
        name: 'compatibility-test',
        streams: [{
          type: 'raw',
          stream: { write: record => records.push(record) },
          level: 'info',
        }],
      })

      logger.info({ probe: true }, 'TELEMETRY_LOG_PROBE')
      setTimeout(async () => {
        await telemetry.flushTelemetry()
        console.log('RAW_COUNT=' + records.length)
        process.exit(0)
      }, 25)
    `

    const output = execFileSync(process.execPath, ['-e', script], {
      encoding: 'utf8',
      env: {
        ...process.env,
        APPLICATIONINSIGHTS_CONNECTION_STRING: '',
      },
    })

    expect(output).toContain("name: '@opentelemetry/instrumentation-bunyan'")
    expect(output).toContain("body: 'TELEMETRY_LOG_PROBE'")
    expect(output).toContain('RAW_COUNT=1')
  })
})

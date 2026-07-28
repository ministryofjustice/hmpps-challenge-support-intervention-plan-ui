import fs from 'fs'

describe('telemetry logging dependencies', () => {
  it('uses a safe implementation of Bunyan file rotation', () => {
    const packageData = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))
    const packageLock = JSON.parse(fs.readFileSync('./package-lock.json', 'utf-8'))

    expect(packageData.dependencies.bunyan).toBe('^1.8.15')
    expect(packageLock.packages['node_modules/mv']).toMatchObject({
      name: 'mv-lite',
      version: '1.0.0',
    })
    expect(packageLock.packages['node_modules/mv/node_modules/mkdirp'].version).toBe('0.5.6')
    expect(packageLock.packages['node_modules/mv/node_modules/glob']).toBeUndefined()
  })
})

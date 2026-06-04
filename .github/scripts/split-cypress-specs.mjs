#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const usage = 'Usage: split-cypress-specs.mjs <split-total> <split-index>'
const splitTotal = Number.parseInt(process.argv[2] || '', 10)
const splitIndex = Number.parseInt(process.argv[3] || '', 10)

if (!Number.isInteger(splitTotal) || splitTotal < 1 || !Number.isInteger(splitIndex) || splitIndex < 0) {
  throw new Error(usage)
}

if (splitIndex >= splitTotal) {
  throw new Error(`split-index must be less than split-total. ${usage}`)
}

const ignoredDirectories = new Set(['.git', 'coverage', 'dist', 'node_modules', 'test_results'])
const specPattern = /\.cy\.(js|jsx|ts|tsx)$/

function findSpecs(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const absolutePath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      return ignoredDirectories.has(entry.name) ? [] : findSpecs(absolutePath)
    }

    if (!entry.isFile() || !specPattern.test(entry.name)) {
      return []
    }

    return path.relative(process.cwd(), absolutePath)
  })
}

const specs = findSpecs(process.cwd()).sort((left, right) => left.localeCompare(right))
const selectedSpecs = specs.filter((_, index) => index % splitTotal === splitIndex)
const specList = selectedSpecs.join(',')

if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `specs=${specList}\n`)
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `spec_count=${selectedSpecs.length}\n`)
}

process.stdout.write(`${specList}\n`)

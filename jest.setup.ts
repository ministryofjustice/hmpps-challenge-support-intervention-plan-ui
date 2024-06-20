/* eslint-disable no-undef */
// eslint-disable-next-line import/no-extraneous-dependencies
import '@testing-library/jest-dom'

// @ts-expect-error setImmediate args have any types
globalThis.setImmediate = globalThis.setImmediate || ((fn, ...args) => global.setTimeout(fn, 0, ...args))

export {}

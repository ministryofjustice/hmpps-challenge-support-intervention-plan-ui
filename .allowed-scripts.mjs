import { configureAllowedScripts } from '@ministryofjustice/hmpps-npm-script-allowlist'

export default configureAllowedScripts({
  allowlist: {
    // Needed by esbuild for watching files during development
    'node_modules/@parcel/watcher@2.5.1': 'ALLOW',
    // Needed by Sentry CLI for error reporting and source map uploads
    'node_modules/@sentry/cli@3.0.3': 'ALLOW',
    // Needed by Cypress for running tests
    'node_modules/cypress@15.8.2': 'ALLOW',
    // Provides native integration, supporting performance monitoring and bunyan logging
    'node_modules/dtrace-provider@0.8.8': 'ALLOW',
    // Needed by esbuild for watching files during development
    'node_modules/esbuild@0.27.2': 'ALLOW',
    // Needed by Jest for running tests in watch mode
    'node_modules/fsevents@2.3.3': 'ALLOW',
    // Native solution to quickly resolve module paths, used by Jest and ESLint
    'node_modules/unrs-resolver@1.11.1': 'ALLOW',
  },
})

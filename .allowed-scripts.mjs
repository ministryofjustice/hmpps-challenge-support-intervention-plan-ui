import { configureAllowedScripts } from '@ministryofjustice/hmpps-npm-script-allowlist'

export default configureAllowedScripts({
   allowlist: {
    // Needed by Sentry CLI for error reporting and source map uploads
    'node_modules/@sentry/cli@2.58.2': 'ALLOW',
    // Needed by Cypress for running tests
    'node_modules/cypress@15.7.0': 'ALLOW',
    // Provides native integration, supporting performance monitoring and bunyan logging
    'node_modules/dtrace-provider@0.8.8': 'ALLOW',
    // Needed by esbuild for watching files during development
    'node_modules/esbuild@0.27.0': 'ALLOW',
    // Needed by Jest for running tests in watch mode
    'node_modules/fsevents@2.3.3': 'ALLOW',
    // Native solution to quickly resolve module paths, used by Jest and ESLint
    'node_modules/unrs-resolver@1.9.2': 'ALLOW',
   },
})

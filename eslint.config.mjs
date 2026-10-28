import hmppsConfig from '@ministryofjustice/eslint-config-hmpps'

export default [
  ...hmppsConfig({
    extraIgnorePaths: ['assets'],
    extraPathsAllowingDevDependencies: ['**/*.cy.ts', '.allowed-scripts.mjs', 'integration_tests/telemetry/probe.cjs'],
  }),
  {
    rules: {
      'dot-notation': 'off',
      'import/prefer-default-export': 0,
    },
  },
]

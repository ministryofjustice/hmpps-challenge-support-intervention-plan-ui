import hmppsConfig from '@ministryofjustice/eslint-config-hmpps'

export default [
  ...hmppsConfig({
    extraIgnorePaths: ['assets'],
    extraPathsAllowingDevDependencies: ['**/*.cy.ts'],
  }),
  {
    rules: {
      'dot-notation': 'off',
      'import/prefer-default-export': 0,
    },
  },
]

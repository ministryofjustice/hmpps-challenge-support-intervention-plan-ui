module.exports = {
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        isolatedModules: true,
      },
    ],
  },
  coveragePathIgnorePatterns: [
    '.*.test.ts',
    'node_modules',
    'server/@types',
    '.*jest.config.js',
    'server/app.ts',
    'server/index.ts',
    '.*.cy.ts',
  ],
  testMatch: ['<rootDir>/(server|job)/**/?(*.)(test).{ts,js,jsx,mjs}'],
  testPathIgnorePatterns: ['<rootDir>/server/routes/journeys', '<rootDir>/server/routes/csip-records', 'node_modules'],
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/server/testutils/nockTeardown.ts'],
  rootDir: '../',
  moduleFileExtensions: ['web.js', 'js', 'json', 'node', 'ts'],
}

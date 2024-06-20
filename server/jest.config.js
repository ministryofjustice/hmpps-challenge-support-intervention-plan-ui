module.exports = {
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        isolatedModules: true,
      },
    ],
  },
  coveragePathIgnorePatterns: ['.*.test.ts', 'node_modules'],
  testMatch: ['<rootDir>/(server|job)/**/?(*.)(cy|test).{ts,js,jsx,mjs}'],
  testPathIgnorePatterns: ['<rootDir>/server/journeys', 'node_modules'],
  testEnvironment: 'node',
  rootDir: '../',
  moduleFileExtensions: ['web.js', 'js', 'json', 'node', 'ts'],
}

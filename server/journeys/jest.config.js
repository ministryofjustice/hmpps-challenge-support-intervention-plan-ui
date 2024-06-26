module.exports = {
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        isolatedModules: true,
      },
    ],
  },
  rootDir: '../../',
  setupFilesAfterEnv: ['<rootDir>jest.setup.ts'],
  coveragePathIgnorePatterns: ['.*.test.ts', 'node_modules'],
  moduleFileExtensions: ['web.js', 'js', 'json', 'node', 'ts'],
  testMatch: ['<rootDir>/server/journeys/**/*.test.ts'],
  testPathIgnorePatterns: ['node_modules'],
  testEnvironment: 'jest-fixed-jsdom',
}

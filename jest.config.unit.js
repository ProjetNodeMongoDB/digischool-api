/**
 * Jest Configuration for Unit Tests
 * Separate config for isolated unit testing with mocks
 */

module.exports = {
  displayName: 'unit',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/tests/unit/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/unit/setup.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/config/**',
    '!src/models/**',  // Models are mocked in unit tests
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    },
    './src/services/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    },
    './src/controllers/': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './src/middlewares/': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1'
  },
  testTimeout: 5000,
  verbose: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  bail: 0,
  coverageReporters: [
    'text',
    'text-summary',
    'lcov',
    'html',
    'json'
  ],
  coverageDirectory: '<rootDir>/coverage'
};

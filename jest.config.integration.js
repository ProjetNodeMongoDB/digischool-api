module.exports = {
    testEnvironment: 'node',
    coveragePathIgnorePatterns: ['/node_modules/'],
    testMatch: ['**/tests/integration/**/*.test.js'],
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/server.js',
        '!src/config/**',
    ],
    setupFilesAfterEnv: ['./tests/setup.js'],
    coverageReporters: [
        'text',
        'text-summary',
        'lcov',
        'html',
        'json'
    ],
    coverageDirectory: './coverage/integration',
    // Remove global coverage thresholds for integration tests
    // Integration tests focus on API endpoints, not comprehensive code coverage
    // Use unit tests for detailed coverage requirements
    verbose: true,
    runInBand: true, // Run tests serially to avoid database conflicts
};
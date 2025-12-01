module.exports = {
    testEnvironment: 'node',
    coveragePathIgnorePatterns: ['/node_modules/'],
    testMatch: ['**/tests/**/*.test.js'],
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
    coverageDirectory: './coverage',
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70
        }
    }
};
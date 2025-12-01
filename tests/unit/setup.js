/**
 * Jest Setup for Unit Tests
 * Configuration and global setup for isolated unit testing
 */

// Mock environment variables for consistent testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-for-unit-tests';
process.env.MONGO_URI = 'mongodb://localhost:27017/test-unit-db';

// Global test timeout for unit tests (shorter than integration tests)
jest.setTimeout(5000);

// Global mocks for external dependencies
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('$2a$10$hashedpassword'),
  compare: jest.fn().mockResolvedValue(true),
  genSalt: jest.fn().mockResolvedValue('$2a$10$salt')
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
  verify: jest.fn().mockReturnValue({ userId: 'mock-user-id', role: 'student' }),
  decode: jest.fn().mockReturnValue({ userId: 'mock-user-id' })
}));

// Mock console methods to keep test output clean (optional)
// Uncomment if you want to suppress console output during tests
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn()
// };

// Global test helpers
global.testHelpers = {
  /**
   * Wait for next tick (useful for async operations)
   */
  nextTick: () => new Promise(resolve => setImmediate(resolve)),

  /**
   * Create mock Date for consistent testing
   */
  mockDate: (dateString = '2023-12-01T10:00:00.000Z') => new Date(dateString),

  /**
   * Generate consistent test ObjectId
   */
  mockObjectId: () => '507f1f77bcf86cd799439011'
};

// Setup and teardown hooks
beforeEach(() => {
  // Clear all mocks before each test to ensure isolation
  jest.clearAllMocks();
});

afterEach(() => {
  // Additional cleanup if needed
  // This runs after each test
});

// Global error handler for unhandled promises
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Optionally fail the test
  throw reason;
});
/**
 * Test Utility Functions
 * Reusable helpers for unit tests
 */

/**
 * Create mock Express request object
 */
const createMockRequest = (overrides = {}) => ({
  params: {},
  body: {},
  query: {},
  headers: {},
  user: null,
  ...overrides
});

/**
 * Create mock Express response object
 */
const createMockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

/**
 * Create mock next function
 */
const createMockNext = () => jest.fn();

/**
 * Create full req/res/next set
 */
const createMockExpressContext = (reqOverrides = {}) => ({
  req: createMockRequest(reqOverrides),
  res: createMockResponse(),
  next: createMockNext()
});

/**
 * Assert that error was passed to next()
 */
const expectErrorPassedToNext = (next, errorMessage) => {
  expect(next).toHaveBeenCalled();
  const error = next.mock.calls[0][0];
  expect(error).toBeInstanceOf(Error);
  if (errorMessage) {
    expect(error.message).toBe(errorMessage);
  }
};

/**
 * Assert successful response structure
 */
const expectSuccessResponse = (res, statusCode, dataKey = 'data') => {
  expect(res.status).toHaveBeenCalledWith(statusCode);
  expect(res.json).toHaveBeenCalled();
  const response = res.json.mock.calls[0][0];
  expect(response.success).toBe(true);
  expect(response[dataKey]).toBeDefined();
};

/**
 * Assert error response structure
 */
const expectErrorResponse = (res, statusCode) => {
  expect(res.status).toHaveBeenCalledWith(statusCode);
  expect(res.json).toHaveBeenCalled();
  const response = res.json.mock.calls[0][0];
  expect(response.success).toBe(false);
  expect(response.error).toBeDefined();
};

/**
 * Wait for all promises to resolve (for async tests)
 */
const flushPromises = () => new Promise(resolve => setImmediate(resolve));

module.exports = {
  createMockRequest,
  createMockResponse,
  createMockNext,
  createMockExpressContext,
  expectErrorPassedToNext,
  expectSuccessResponse,
  expectErrorResponse,
  flushPromises
};

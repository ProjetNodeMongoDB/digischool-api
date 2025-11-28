/**
 * Mock Factory for Services
 * Provides pre-configured mocks for service modules
 */

/**
 * Create mock service with all CRUD methods
 */
const createServiceMock = () => ({
  getAll: jest.fn(),
  getAllWithFilter: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
});

/**
 * Create auth service mock
 */
const createAuthServiceMock = () => ({
  register: jest.fn(),
  login: jest.fn(),
  generateToken: jest.fn(),
  verifyToken: jest.fn()
});

/**
 * Create grade service mock (with filter methods)
 */
const createGradeServiceMock = () => ({
  ...createServiceMock(),
  getByStudent: jest.fn(),
  getByClass: jest.fn(),
  getByTrimester: jest.fn()
});

/**
 * Reset all mocks in a service
 */
const resetServiceMock = (serviceMock) => {
  Object.values(serviceMock).forEach(mockFn => {
    if (jest.isMockFunction(mockFn)) {
      mockFn.mockReset();
    }
  });
};

module.exports = {
  createServiceMock,
  createAuthServiceMock,
  createGradeServiceMock,
  resetServiceMock
};

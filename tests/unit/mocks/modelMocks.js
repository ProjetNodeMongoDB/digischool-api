/**
 * Mock Factory for Mongoose Models
 * Creates mock implementations for common Mongoose methods
 */

const createModelMock = () => {
  return {
    // Query methods
    find: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    findByIdAndUpdate: jest.fn().mockReturnThis(),
    findByIdAndDelete: jest.fn().mockReturnThis(),

    // Chainable query methods
    populate: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),

    // Execution methods
    exec: jest.fn(),

    // Constructor for creating instances
    mockConstructor: jest.fn().mockImplementation(function(data) {
      Object.assign(this, data);
      this.save = jest.fn().mockResolvedValue(this);
      return this;
    })
  };
};

/**
 * Helper to create a mock Mongoose model with all methods
 */
const createMockModel = (ModelName) => {
  const mockModel = createModelMock();

  // Make constructor callable with 'new'
  const MockModel = mockModel.mockConstructor;

  // Attach query methods as static methods
  Object.keys(mockModel).forEach(key => {
    if (key !== 'mockConstructor') {
      MockModel[key] = mockModel[key];
    }
  });

  return MockModel;
};

/**
 * Quick setup for common patterns
 */
const setupModelMock = {
  // Mock successful find all
  findAll: (mockModel, data) => {
    mockModel.find.mockResolvedValue(data);
    return mockModel;
  },

  // Mock successful findById
  findById: (mockModel, data) => {
    mockModel.findById.mockResolvedValue(data);
    return mockModel;
  },

  // Mock not found
  notFound: (mockModel, method = 'findById') => {
    mockModel[method].mockResolvedValue(null);
    return mockModel;
  },

  // Mock error
  error: (mockModel, method, errorMessage) => {
    mockModel[method].mockRejectedValue(new Error(errorMessage));
    return mockModel;
  },

  // Mock save success
  saveSuccess: (mockModel, data) => {
    mockModel.prototype.save = jest.fn().mockResolvedValue(data);
    return mockModel;
  }
};

module.exports = {
  createModelMock,
  createMockModel,
  setupModelMock
};

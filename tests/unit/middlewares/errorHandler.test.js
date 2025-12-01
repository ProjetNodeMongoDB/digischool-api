/**
 * Unit Tests for Error Handler Middleware
 * Tests Mongoose error transformations, JWT errors, and environment-specific behavior
 */

const errorHandler = require('../../../src/middlewares/errorHandler');
const { createMockExpressContext } = require('../helpers/testUtils');

describe('errorHandler', () => {
  let req, res, next;
  let originalNodeEnv;

  beforeEach(() => {
    ({ req, res, next } = createMockExpressContext());
    originalNodeEnv = process.env.NODE_ENV;
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe('Mongoose Validation Errors', () => {
    it('should transform ValidationError to 400 with field messages', () => {
      // Arrange
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      error.errors = {
        nom: { message: 'Name is required' },
        email: { message: 'Email is invalid' }
      };

      // Act
      errorHandler(error, req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      const response = res.json.mock.calls[0][0];
      expect(response.success).toBe(false);
      expect(response.error).toBe('Validation Error');
      expect(response.details).toEqual(
        expect.arrayContaining([
          'Name is required',
          'Email is invalid'
        ])
      );
    });

    it('should handle ValidationError with single field', () => {
      // Arrange
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      error.errors = {
        nom: { message: 'Name is required' }
      };

      // Act
      errorHandler(error, req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      const response = res.json.mock.calls[0][0];
      expect(response.details).toEqual(['Name is required']);
    });

    it('should handle ValidationError with multiple fields', () => {
      // Arrange
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      error.errors = {
        nom: { message: 'Name is required' },
        prenom: { message: 'First name is required' },
        email: { message: 'Email is invalid' },
        dateNaissance: { message: 'Birth date must be in the past' }
      };

      // Act
      errorHandler(error, req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      const response = res.json.mock.calls[0][0];
      expect(response.details).toHaveLength(4);
    });
  });

  describe('Mongoose Duplicate Key Errors', () => {
    it('should transform duplicate key error (code 11000) to 400', () => {
      // Arrange
      const error = new Error('Duplicate key');
      error.code = 11000;
      error.keyValue = { email: 'test@test.com' };

      // Act
      errorHandler(error, req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      const response = res.json.mock.calls[0][0];
      expect(response.success).toBe(false);
      expect(response.error).toBe('Duplicate field value entered');
    });
  });

  describe('Mongoose CastError', () => {
    it('should transform CastError to 400', () => {
      // Arrange
      const error = new Error('Cast to ObjectId failed');
      error.name = 'CastError';
      error.value = 'invalid-id';
      error.path = '_id';

      // Act
      errorHandler(error, req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      const response = res.json.mock.calls[0][0];
      expect(response.success).toBe(false);
      expect(response.error).toBe('Invalid ID format');
    });
  });

  describe('JWT Errors', () => {
    it('should transform JsonWebTokenError to 401', () => {
      // Arrange
      const error = new Error('Invalid token');
      error.name = 'JsonWebTokenError';

      // Act
      errorHandler(error, req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      const response = res.json.mock.calls[0][0];
      expect(response.success).toBe(false);
      expect(response.error).toBe('Invalid token');
    });

    it('should transform TokenExpiredError to 401', () => {
      // Arrange
      const error = new Error('Token expired');
      error.name = 'TokenExpiredError';

      // Act
      errorHandler(error, req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      const response = res.json.mock.calls[0][0];
      expect(response.success).toBe(false);
      expect(response.error).toBe('Token expired');
    });
  });

  describe('Generic Errors', () => {
    it('should return 500 with error message for unknown errors', () => {
      // Arrange
      const error = new Error('Something went wrong');

      // Act
      errorHandler(error, req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      const response = res.json.mock.calls[0][0];
      expect(response.success).toBe(false);
      expect(response.error).toBe('Something went wrong');
    });

    it('should return generic message when error has no message', () => {
      // Arrange
      const error = new Error();

      // Act
      errorHandler(error, req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      const response = res.json.mock.calls[0][0];
      expect(response.error).toBe('Internal Server Error');
    });

    it('should use statusCode property if provided on error object', () => {
      // Arrange
      const error = new Error('Bad request');
      error.statusCode = 400;

      // Act
      errorHandler(error, req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('Environment-Specific Behavior', () => {
    it('should include stack trace in development', () => {
      // Arrange
      process.env.NODE_ENV = 'development';
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at testFile.js:10:5';

      // Act
      errorHandler(error, req, res, next);

      // Assert
      const response = res.json.mock.calls[0][0];
      expect(response.stack).toBeDefined();
      expect(response.stack).toBe(error.stack);
    });

    it('should NOT include stack trace in production', () => {
      // Arrange
      process.env.NODE_ENV = 'production';
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at testFile.js:10:5';

      // Act
      errorHandler(error, req, res, next);

      // Assert
      const response = res.json.mock.calls[0][0];
      expect(response.stack).toBeUndefined();
    });

    it('should NOT include stack trace when NODE_ENV is not development', () => {
      // Arrange
      process.env.NODE_ENV = 'staging';
      const error = new Error('Test error');

      // Act
      errorHandler(error, req, res, next);

      // Assert
      const response = res.json.mock.calls[0][0];
      expect(response.stack).toBeUndefined();
    });
  });
});

/**
 * Unit Tests for Validation Middleware
 * Tests express-validator integration and validation error formatting
 */

const { validate } = require('../../../src/middlewares/validation');
const { validationResult } = require('express-validator');
const { createMockExpressContext } = require('../helpers/testUtils');

jest.mock('express-validator');

describe('validation middleware', () => {
  let req, res, next;

  beforeEach(() => {
    ({ req, res, next } = createMockExpressContext());
    jest.clearAllMocks();
  });

  describe('validate - Success Cases', () => {
    it('should call next when no validation errors', () => {
      // Arrange
      validationResult.mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(true),
        array: jest.fn().mockReturnValue([])
      });

      // Act
      validate(req, res, next);

      // Assert
      expect(validationResult).toHaveBeenCalledWith(req);
      expect(next).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should call next when validation array is empty', () => {
      // Arrange
      validationResult.mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(true),
        array: jest.fn().mockReturnValue([])
      });

      // Act
      validate(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('validate - Error Cases', () => {
    it('should return 400 with errors when validation fails', () => {
      // Arrange
      const mockErrors = [
        { path: 'nom', msg: 'Name is required' },
        { path: 'email', msg: 'Email is invalid' }
      ];

      validationResult.mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue(mockErrors)
      });

      // Act
      validate(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      const response = res.json.mock.calls[0][0];
      expect(response.success).toBe(false);
      expect(response.error).toBe('Validation failed');
      expect(response.details).toEqual([
        { field: 'nom', message: 'Name is required' },
        { field: 'email', message: 'Email is invalid' }
      ]);
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle single validation error', () => {
      // Arrange
      const mockErrors = [
        { path: 'nom', msg: 'Name is required' }
      ];

      validationResult.mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue(mockErrors)
      });

      // Act
      validate(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      const response = res.json.mock.calls[0][0];
      expect(response.details).toHaveLength(1);
      expect(response.details[0]).toEqual({
        field: 'nom',
        message: 'Name is required'
      });
    });

    it('should format multiple errors correctly', () => {
      // Arrange
      const mockErrors = [
        { path: 'nom', msg: 'Name is required' },
        { path: 'prenom', msg: 'First name is required' },
        { path: 'email', msg: 'Email is invalid' }
      ];

      validationResult.mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue(mockErrors)
      });

      // Act
      validate(req, res, next);

      // Assert
      const response = res.json.mock.calls[0][0];
      expect(response.details).toHaveLength(3);
      expect(response.details[0]).toEqual({
        field: 'nom',
        message: 'Name is required'
      });
      expect(response.details[1]).toEqual({
        field: 'prenom',
        message: 'First name is required'
      });
      expect(response.details[2]).toEqual({
        field: 'email',
        message: 'Email is invalid'
      });
    });

    it('should handle errors with nested field paths', () => {
      // Arrange
      const mockErrors = [
        { path: 'user.email', msg: 'Email is required' },
        { path: 'user.password', msg: 'Password is too short' }
      ];

      validationResult.mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue(mockErrors)
      });

      // Act
      validate(req, res, next);

      // Assert
      const response = res.json.mock.calls[0][0];
      expect(response.details).toEqual([
        { field: 'user.email', message: 'Email is required' },
        { field: 'user.password', message: 'Password is too short' }
      ]);
    });

    it('should handle special characters in error messages', () => {
      // Arrange
      const mockErrors = [
        { path: 'nom', msg: 'Name must not contain special characters @#$%' },
        { path: 'email', msg: 'Email format should be: user@example.com' }
      ];

      validationResult.mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue(mockErrors)
      });

      // Act
      validate(req, res, next);

      // Assert
      const response = res.json.mock.calls[0][0];
      expect(response.details[0].message).toBe('Name must not contain special characters @#$%');
      expect(response.details[1].message).toBe('Email format should be: user@example.com');
    });
  });
});

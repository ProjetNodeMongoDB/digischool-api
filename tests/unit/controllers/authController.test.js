/**
 * Unit Tests for AuthController
 * Tests HTTP request/response handling with mocked service layer
 * Includes complex JWT authentication and admin operations
 */

const authController = require('../../../src/controllers/authController');
const authService = require('../../../src/services/authService');
const { createMockExpressContext } = require('../helpers/testUtils');
const { users, mockIds, edgeCases } = require('../mocks/fixtures');

// Mock the service layer
jest.mock('../../../src/services/authService');

// Mock User model for admin operations
jest.mock('../../../src/models/User', () => ({
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn()
}));

const User = require('../../../src/models/User');

describe('AuthController', () => {
  let req, res, next;

  beforeEach(() => {
    // Create fresh mocks for each test
    ({ req, res, next } = createMockExpressContext());
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should return 201 with token and user data', async () => {
      // Arrange
      req.body = users.validInput;
      const mockResult = {
        data: {
          token: 'jwt.token.here',
          user: { ...users.valid, password: undefined }
        }
      };
      authService.register.mockResolvedValue(mockResult);

      // Act
      await authController.register(req, res, next);

      // Assert
      expect(authService.register).toHaveBeenCalledWith({
        username: users.validInput.username,
        email: users.validInput.email,
        password: users.validInput.password
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'User registered successfully',
        data: mockResult.data
      });
    });

    it('should call next with error for duplicate email', async () => {
      // Arrange
      req.body = users.validInput;
      const error = new Error('Email already exists');
      error.code = 11000;
      authService.register.mockRejectedValue(error);

      // Act
      await authController.register(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle weak password error', async () => {
      // Arrange
      req.body = { ...users.validInput, password: '123' };
      const error = new Error('Password too weak');
      authService.register.mockRejectedValue(error);

      // Act
      await authController.register(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should not pass role from request body', async () => {
      // Arrange
      req.body = { ...users.validInput, role: 'admin' };  // Attempt to set role
      const mockResult = {
        data: {
          token: 'jwt.token.here',
          user: { ...users.valid, role: 'student' }  // Role should default to student
        }
      };
      authService.register.mockResolvedValue(mockResult);

      // Act
      await authController.register(req, res, next);

      // Assert - Verify role is NOT passed to service
      expect(authService.register).toHaveBeenCalledWith({
        username: users.validInput.username,
        email: users.validInput.email,
        password: users.validInput.password
        // role should NOT be here
      });
    });

    it('should handle missing required fields', async () => {
      // Arrange
      req.body = { email: 'test@test.com' }; // Missing username and password
      const error = new Error('Username and password are required');
      authService.register.mockRejectedValue(error);

      // Act
      await authController.register(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle malicious input sanitization', async () => {
      // Arrange - Script injection attempt
      req.body = {
        username: '<script>alert("xss")</script>',
        email: 'test@test.com',
        password: 'password123'
      };
      const error = new Error('Invalid username format');
      authService.register.mockRejectedValue(error);

      // Act
      await authController.register(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle extremely long input values', async () => {
      // Arrange
      req.body = {
        username: 'a'.repeat(1000), // Extremely long username
        email: 'test@test.com',
        password: 'password123'
      };
      const error = new Error('Username too long');
      authService.register.mockRejectedValue(error);

      // Act
      await authController.register(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle special characters in username', async () => {
      // Arrange
      req.body = {
        username: 'user@#$%',
        email: 'test@test.com',
        password: 'password123'
      };
      const mockResult = {
        data: {
          token: 'jwt.token.here',
          user: { ...users.valid, username: 'user@#$%' }
        }
      };
      authService.register.mockResolvedValue(mockResult);

      // Act
      await authController.register(req, res, next);

      // Assert
      expect(authService.register).toHaveBeenCalledWith({
        username: 'user@#$%',
        email: 'test@test.com',
        password: 'password123'
      });
    });
  });

  describe('login', () => {
    it('should return 200 with token and user data', async () => {
      // Arrange
      req.body = { email: 'test@test.com', password: 'password123' };
      const mockResult = {
        data: {
          token: 'jwt.token.here',
          user: { ...users.valid }
        }
      };
      authService.login.mockResolvedValue(mockResult);

      // Act
      await authController.login(req, res, next);

      // Assert
      expect(authService.login).toHaveBeenCalledWith(req.body.email, req.body.password);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Login successful',
        data: mockResult.data
      });
    });

    it('should call next with error for invalid credentials', async () => {
      // Arrange
      req.body = { email: 'test@test.com', password: 'wrong' };
      const error = new Error('Invalid credentials');
      authService.login.mockRejectedValue(error);

      // Act
      await authController.login(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle missing email', async () => {
      // Arrange
      req.body = { password: 'password123' };
      const error = new Error('Email required');
      authService.login.mockRejectedValue(error);

      // Act
      await authController.login(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle missing password', async () => {
      // Arrange
      req.body = { email: 'test@test.com' };
      const error = new Error('Password required');
      authService.login.mockRejectedValue(error);

      // Act
      await authController.login(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle invalid email format', async () => {
      // Arrange
      req.body = { email: 'invalid-email', password: 'password123' };
      const error = new Error('Please provide a valid email address');
      authService.login.mockRejectedValue(error);

      // Act
      await authController.login(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle account locked scenarios', async () => {
      // Arrange
      req.body = { email: 'locked@test.com', password: 'password123' };
      const error = new Error('Account is temporarily locked due to too many failed login attempts');
      authService.login.mockRejectedValue(error);

      // Act
      await authController.login(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle SQL injection attempt in email', async () => {
      // Arrange - Simulate malicious input
      req.body = { email: "'; DROP TABLE users; --", password: 'password123' };
      const error = new Error('Invalid email format');
      authService.login.mockRejectedValue(error);

      // Act
      await authController.login(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('logout', () => {
    it('should return 200 with logout message', async () => {
      // Act
      await authController.logout(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Logout successful. Please remove the token from client storage.'
      });
    });

    it('should call next with error on failure', async () => {
      // Arrange
      res.status = jest.fn(() => {
        throw new Error('Unexpected error');
      });

      // Act
      await authController.logout(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
    });

    it('should handle logout when user is not authenticated', async () => {
      // Arrange
      req.user = null; // No authenticated user

      // Act
      await authController.logout(req, res, next);

      // Assert - Should still succeed (stateless logout)
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Logout successful. Please remove the token from client storage.'
      });
    });

    it('should handle multiple logout attempts', async () => {
      // Arrange - Simulate already logged out user
      req.user = { _id: mockIds.user1, isActive: false };

      // Act
      await authController.logout(req, res, next);

      // Assert - Should handle gracefully
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Logout successful. Please remove the token from client storage.'
      });
    });
  });

  describe('getAllUsers', () => {
    it('should return 200 with all users', async () => {
      // Arrange
      const mockUsers = [
        { ...users.valid, password: undefined },
        { _id: mockIds.user1, username: 'test2', email: 'test2@test.com', role: 'student' }
      ];
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockUsers)
      };
      User.find.mockReturnValue(mockQuery);

      // Act
      await authController.getAllUsers(req, res, next);

      // Assert
      expect(User.find).toHaveBeenCalledWith({});
      expect(mockQuery.select).toHaveBeenCalledWith('-password');
      expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: mockUsers.length,
        data: {
          users: mockUsers
        }
      });
    });

    it('should call next with error on failure', async () => {
      // Arrange
      const error = new Error('Database error');
      User.find.mockImplementation(() => {
        throw error;
      });

      // Act
      await authController.getAllUsers(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('updateUserRole', () => {
    it('should return 200 with updated user', async () => {
      // Arrange
      req.params.userId = mockIds.user1;
      req.body.role = 'teacher';
      req.user = {
        _id: mockIds.teacher1,
        username: 'admin',
        role: 'admin'
      };
      const targetUser = {
        _id: mockIds.user1,
        username: 'student1',
        role: 'student'
      };
      const updatedUser = {
        ...targetUser,
        role: 'teacher',
        toSafeObject: jest.fn().mockReturnValue({ ...targetUser, role: 'teacher' })
      };

      User.findById.mockResolvedValue(targetUser);

      // Mock the chained select method
      const mockQuery = {
        select: jest.fn().mockResolvedValue(updatedUser)
      };
      User.findByIdAndUpdate.mockReturnValue(mockQuery);

      // Act
      await authController.updateUserRole(req, res, next);

      // Assert
      expect(User.findById).toHaveBeenCalledWith(mockIds.user1);
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        mockIds.user1,
        { role: 'teacher' },
        {
          new: true,
          runValidators: true
        }
      );
      expect(mockQuery.select).toHaveBeenCalledWith('-password');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'User role updated from student to teacher',
        data: {
          user: updatedUser.toSafeObject()
        }
      });
    });

    it('should prevent self-role modification', async () => {
      // Arrange
      req.params.userId = mockIds.user1;
      req.body.role = 'admin';
      req.user = {
        _id: mockIds.user1,  // Same as target user
        username: 'admin',
        role: 'admin'
      };

      // Act
      await authController.updateUserRole(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Cannot modify your own role for security reasons'
      });
      expect(User.findById).not.toHaveBeenCalled();
    });

    it('should return 404 when user not found', async () => {
      // Arrange
      req.params.userId = edgeCases.nonExistentId;
      req.body.role = 'teacher';
      req.user = {
        _id: mockIds.teacher1,
        username: 'admin',
        role: 'admin'
      };
      User.findById.mockResolvedValue(null);

      // Act
      await authController.updateUserRole(req, res, next);

      // Assert
      expect(User.findById).toHaveBeenCalledWith(edgeCases.nonExistentId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'User not found'
      });
    });

    it('should call next with error on update failure', async () => {
      // Arrange
      req.params.userId = mockIds.user1;
      req.body.role = 'teacher';
      req.user = {
        _id: mockIds.teacher1,
        username: 'admin',
        role: 'admin'
      };
      const targetUser = { _id: mockIds.user1, username: 'student1', role: 'student' };
      const error = new Error('Update failed');
      User.findById.mockResolvedValue(targetUser);

      // Mock the chained select method to throw error
      const mockQuery = {
        select: jest.fn().mockRejectedValue(error)
      };
      User.findByIdAndUpdate.mockReturnValue(mockQuery);

      // Act
      await authController.updateUserRole(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});

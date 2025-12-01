/**
 * Unit Tests for Authentication Middleware
 * Tests JWT token verification, token extraction, and user attachment
 */

const authMiddleware = require('../../../src/middlewares/authMiddleware');
const authService = require('../../../src/services/authService');
const { createMockExpressContext } = require('../helpers/testUtils');
const { mockIds, users } = require('../mocks/fixtures');

jest.mock('../../../src/services/authService');

describe('authMiddleware', () => {
  let req, res, next;

  beforeEach(() => {
    ({ req, res, next } = createMockExpressContext());
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('protect - Token Extraction', () => {
    it('should extract and verify token from Bearer header', async () => {
      // Arrange
      req.headers.authorization = 'Bearer validtoken123';
      const decoded = { userId: mockIds.user1 };
      const mockUser = { ...users.valid, _id: mockIds.user1 };

      authService.verifyToken.mockResolvedValue({
        success: true,
        data: {
          user: mockUser,
          decoded
        }
      });

      // Act
      await authMiddleware.protect(req, res, next);

      // Assert
      expect(authService.verifyToken).toHaveBeenCalledWith('validtoken123');
      expect(req.user).toEqual(mockUser);
      expect(req.decoded).toEqual(decoded);
      expect(next).toHaveBeenCalledWith();
    });

    it('should reject request without Authorization header', async () => {
      // Arrange
      req.headers.authorization = undefined;

      // Act
      await authMiddleware.protect(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Access denied. No token provided.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject request with malformed Authorization header', async () => {
      // Arrange
      req.headers.authorization = 'InvalidFormat token123';

      // Act
      await authMiddleware.protect(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Access denied. Invalid token format. Use: Bearer <token>'
      });
    });

    it('should reject request with only "Bearer" keyword', async () => {
      // Arrange
      req.headers.authorization = 'Bearer';

      // Act
      await authMiddleware.protect(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Access denied. Invalid token format. Use: Bearer <token>'
      });
    });
  });

  describe('protect - Token Verification', () => {
    it('should reject invalid token', async () => {
      // Arrange
      req.headers.authorization = 'Bearer invalidtoken';
      authService.verifyToken.mockResolvedValue({
        success: false
      });

      // Act
      await authMiddleware.protect(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Access denied. Invalid token.'
      });
    });

    it('should reject expired token', async () => {
      // Arrange
      req.headers.authorization = 'Bearer expiredtoken';
      const error = new Error('Token expired');
      authService.verifyToken.mockRejectedValue(error);

      // Act
      await authMiddleware.protect(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Access denied. Token has expired.'
      });
    });

    it('should reject token with invalid signature', async () => {
      // Arrange
      req.headers.authorization = 'Bearer tamperedtoken';
      const error = new Error('Invalid token');
      authService.verifyToken.mockRejectedValue(error);

      // Act
      await authMiddleware.protect(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Access denied. Invalid token.'
      });
    });
  });

  describe('protect - User Lookup', () => {
    it('should attach user to request when token verified', async () => {
      // Arrange
      req.headers.authorization = 'Bearer validtoken';
      const decoded = { userId: mockIds.user1 };
      const mockUser = {
        _id: mockIds.user1,
        username: 'testuser',
        email: 'test@test.com',
        role: 'student'
      };

      authService.verifyToken.mockResolvedValue({
        success: true,
        data: {
          user: mockUser,
          decoded
        }
      });

      // Act
      await authMiddleware.protect(req, res, next);

      // Assert
      expect(req.user).toBeDefined();
      expect(req.user._id).toBe(mockIds.user1);
      expect(req.user.username).toBe('testuser');
      expect(next).toHaveBeenCalledWith();
    });

    it('should reject when user no longer exists in database', async () => {
      // Arrange
      req.headers.authorization = 'Bearer validtoken';
      const error = new Error('User no longer exists');
      authService.verifyToken.mockRejectedValue(error);

      // Act
      await authMiddleware.protect(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('authorize - Role-based Authorization', () => {
    it('should allow user with authorized role', () => {
      // Arrange
      req.user = { role: 'teacher' };
      const middleware = authMiddleware.authorize('teacher', 'admin');

      // Act
      middleware(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject user without authorized role', () => {
      // Arrange
      req.user = { role: 'student' };
      const middleware = authMiddleware.authorize('teacher', 'admin');

      // Act
      middleware(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Access denied. Requires one of these roles: teacher, admin'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject when user is not authenticated', () => {
      // Arrange
      req.user = undefined;
      const middleware = authMiddleware.authorize('teacher');

      // Act
      middleware(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Access denied. Authentication required.'
      });
    });
  });

  describe('optionalAuth - Optional Authentication', () => {
    it('should continue without user when no token provided', async () => {
      // Arrange
      req.headers.authorization = undefined;

      // Act
      await authMiddleware.optionalAuth(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should attach user when valid token provided', async () => {
      // Arrange
      req.headers.authorization = 'Bearer validtoken';
      const mockUser = { _id: mockIds.user1, role: 'student' };
      const decoded = { userId: mockIds.user1 };

      authService.verifyToken.mockResolvedValue({
        success: true,
        data: {
          user: mockUser,
          decoded
        }
      });

      // Act
      await authMiddleware.optionalAuth(req, res, next);

      // Assert
      expect(req.user).toEqual(mockUser);
      expect(req.decoded).toEqual(decoded);
      expect(next).toHaveBeenCalledWith();
    });

    it('should continue even if token verification fails', async () => {
      // Arrange
      req.headers.authorization = 'Bearer invalidtoken';
      authService.verifyToken.mockRejectedValue(new Error('Invalid token'));

      // Act
      await authMiddleware.optionalAuth(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});

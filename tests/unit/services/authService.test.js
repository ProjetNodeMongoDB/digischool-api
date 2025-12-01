const authService = require('../../../src/services/authService');
const User = require('../../../src/models/User');
const jwt = require('jsonwebtoken');
const { users, mockIds, edgeCases } = require('../mocks/fixtures');

jest.mock('../../../src/models/User');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should create user and return user with token', async () => {
      const userData = users.validInput;
      const savedUser = {
        ...userData,
        _id: mockIds.user2,
        password: '$2a$10$hashedpassword',
        toSafeObject: jest.fn(() => ({
          _id: mockIds.user2,
          username: userData.username,
          email: userData.email,
          role: userData.role,
        })),
      };

      User.findOne.mockResolvedValue(null);

      User.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(savedUser),
        ...savedUser,
      }));

      jwt.sign.mockReturnValue('jwt.token.here');

      const result = await authService.register(userData);

      expect(User.findOne).toHaveBeenCalledWith({
        $or: [{ email: userData.email }, { username: userData.username }],
      });
      expect(result.success).toBe(true);
      expect(result.data.token).toBe('jwt.token.here');
      expect(result.data.user).toBeDefined();
    });

    it('should throw error when user with email already exists', async () => {
      User.findOne.mockResolvedValue(users.valid);

      await expect(authService.register(users.duplicate))
        .rejects.toThrow('User with this email or username already exists');
    });

    it('should throw error when user with username already exists', async () => {
      User.findOne.mockResolvedValue(users.valid);

      await expect(authService.register(users.duplicate))
        .rejects.toThrow('User with this email or username already exists');
    });

    it('should set default role to student when not provided', async () => {
      const userDataWithoutRole = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
      };
      const savedUser = {
        ...userDataWithoutRole,
        _id: mockIds.user2,
        role: 'student',
        password: '$2a$10$hashedpassword',
        toSafeObject: jest.fn(() => ({
          _id: mockIds.user2,
          username: userDataWithoutRole.username,
          email: userDataWithoutRole.email,
          role: 'student',
        })),
      };

      User.findOne.mockResolvedValue(null);

      User.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(savedUser),
        ...savedUser,
      }));

      jwt.sign.mockReturnValue('jwt.token.here');

      const result = await authService.register(userDataWithoutRole);

      expect(result.success).toBe(true);
      expect(result.data.user.role).toBe('student');
    });

    it('should allow setting role for admin registration', async () => {
      const adminData = users.adminInput;
      const savedUser = {
        ...adminData,
        _id: mockIds.user2,
        password: '$2a$10$hashedpassword',
        toSafeObject: jest.fn(() => ({
          _id: mockIds.user2,
          username: adminData.username,
          email: adminData.email,
          role: 'admin',
        })),
      };

      User.findOne.mockResolvedValue(null);

      User.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(savedUser),
        ...savedUser,
      }));

      jwt.sign.mockReturnValue('jwt.token.here');

      const result = await authService.register(adminData);

      expect(result.success).toBe(true);
      expect(result.data.user.role).toBe('admin');
    });

    it('should handle validation errors', async () => {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';

      User.findOne.mockResolvedValue(null);

      User.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(error),
      }));

      await expect(authService.register(users.invalid))
        .rejects.toThrow('Registration failed: Validation failed');
    });

    it('should propagate database errors', async () => {
      User.findOne.mockRejectedValue(new Error('DB error'));

      await expect(authService.register(users.validInput))
        .rejects.toThrow('Registration failed: DB error');
    });
  });

  describe('login', () => {
    it('should return user and token for valid credentials', async () => {
      const credentials = { email: 'john@example.com', password: 'password123' };
      const user = {
        ...users.valid,
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(user),
      });

      jwt.sign.mockReturnValue('jwt.token.here');

      const result = await authService.login(credentials.email, credentials.password);

      expect(User.findOne).toHaveBeenCalledWith({ email: credentials.email });
      expect(user.comparePassword).toHaveBeenCalledWith(credentials.password);
      expect(result.success).toBe(true);
      expect(result.data.token).toBe('jwt.token.here');
      expect(result.data.user).toBeDefined();
    });

    it('should throw error when user not found', async () => {
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await expect(authService.login('notfound@example.com', 'password'))
        .rejects.toThrow('Invalid email or password');
    });

    it('should throw error when password incorrect', async () => {
      const user = {
        ...users.valid,
        comparePassword: jest.fn().mockResolvedValue(false),
      };

      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(user),
      });

      await expect(authService.login('john@example.com', 'wrongpassword'))
        .rejects.toThrow('Invalid email or password');
    });

    it('should propagate database errors', async () => {
      User.findOne.mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error('DB error')),
      });

      await expect(authService.login('john@example.com', 'password'))
        .rejects.toThrow('Login failed: DB error');
    });
  });

  describe('generateToken', () => {
    it('should generate valid JWT token with user data', () => {
      const user = users.valid;
      const token = 'generated.jwt.token';

      jwt.sign.mockReturnValue(token);

      const result = authService.generateToken(user);

      expect(jwt.sign).toHaveBeenCalledWith(
        {
          userId: user._id,
          email: user.email,
          username: user.username,
          role: user.role,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_EXPIRE,
        }
      );
      expect(result).toBe(token);
    });

    it('should include correct user payload', () => {
      const user = {
        _id: mockIds.user1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'teacher',
      };

      jwt.sign.mockReturnValue('token');

      authService.generateToken(user);

      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: user._id,
          email: user.email,
          username: user.username,
          role: user.role,
        }),
        expect.any(String),
        expect.any(Object)
      );
    });
  });

  describe('verifyToken', () => {
    it('should verify and return decoded token with user', async () => {
      const token = 'valid.jwt.token';
      const decoded = {
        userId: mockIds.user1,
        email: 'john@example.com',
        username: 'johndoe',
        role: 'student',
      };

      jwt.verify.mockReturnValue(decoded);
      User.findById.mockResolvedValue(users.valid);

      const result = await authService.verifyToken(token);

      expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
      expect(User.findById).toHaveBeenCalledWith(decoded.userId);
      expect(result.success).toBe(true);
      expect(result.data.decoded).toEqual(decoded);
      expect(result.data.user).toBeDefined();
    });

    it('should throw error for invalid token', async () => {
      const error = new Error('Invalid signature');
      error.name = 'JsonWebTokenError';

      jwt.verify.mockImplementation(() => {
        throw error;
      });

      await expect(authService.verifyToken('invalid.token'))
        .rejects.toThrow('Invalid token');
    });

    it('should throw error for expired token', async () => {
      const error = new Error('jwt expired');
      error.name = 'TokenExpiredError';

      jwt.verify.mockImplementation(() => {
        throw error;
      });

      await expect(authService.verifyToken('expired.token'))
        .rejects.toThrow('Token expired');
    });

    it('should throw error when user no longer exists', async () => {
      const token = 'valid.jwt.token';
      const decoded = {
        userId: mockIds.user1,
        email: 'john@example.com',
      };

      jwt.verify.mockReturnValue(decoded);
      User.findById.mockResolvedValue(null);

      await expect(authService.verifyToken(token))
        .rejects.toThrow('User no longer exists');
    });

    it('should propagate database errors', async () => {
      const token = 'valid.jwt.token';
      const decoded = { userId: mockIds.user1 };

      jwt.verify.mockReturnValue(decoded);
      User.findById.mockRejectedValue(new Error('DB error'));

      await expect(authService.verifyToken(token))
        .rejects.toThrow('Token verification failed: DB error');
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      User.findById.mockResolvedValue(users.valid);

      const result = await authService.getUserById(mockIds.user1);

      expect(User.findById).toHaveBeenCalledWith(mockIds.user1);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should throw error when user not found', async () => {
      User.findById.mockResolvedValue(null);

      await expect(authService.getUserById(edgeCases.nonExistentId))
        .rejects.toThrow('User not found');
    });

    it('should propagate database errors', async () => {
      User.findById.mockRejectedValue(new Error('DB error'));

      await expect(authService.getUserById(mockIds.user1))
        .rejects.toThrow('Failed to get user: DB error');
    });
  });
});

const jwt = require('jsonwebtoken');
const User = require('../models/User');


class AuthService {
    /**
     * Register a new user
     * @param {Object} userData - User registration data
     * @param {string} userData.username - Username
     * @param {string} userData.email - Email address
     * @param {string} userData.password - Plain text password (will be hashed)
     * @param {string} [userData.role] - User role (admin, teacher, student) - Optional, defaults to 'student'
     * @returns {Object} New user object and JWT token
     */
    async register({ username, email, password, role = undefined }) {
        try {
            // Check if user already exists
            const existingUser = await User.findOne({
                $or: [{ email }, { username }]
            });

            if (existingUser) {
                const error = new Error('User with this email or username already exists');
                error.statusCode = 400;
                throw error;
            }

            // Create new user (password will be automatically hashed by pre-save hook)
            const userData = {
                username,
                email,
                password
            };

            // Only set role if explicitly provided (for admin use)
            // Otherwise let the User model default to 'student'
            if (role !== undefined) {
                userData.role = role;
            }

            const user = new User(userData);

            await user.save();

            // Generate JWT token
            const token = this.generateToken(user);

            // Return safe user object (without password) and token
            return {
                success: true,
                data: {
                    user: user.toSafeObject(),
                    token
                }
            };

        } catch (error) {
            // Preserve statusCode if set
            if (error.statusCode) {
                const newError = new Error(`Registration failed: ${error.message}`);
                newError.statusCode = error.statusCode;
                throw newError;
            }
            throw new Error(`Registration failed: ${error.message}`);
        }
    }

    /**
     * Login user with email and password
     * @param {string} email - User email
     * @param {string} password - Plain text password
     * @returns {Object} User object and JWT token
     */
    async login(email, password) {
        try {
            // Find user by email and include password for comparison
            const user = await User.findOne({ email }).select('+password');

            if (!user) {
                const error = new Error('Invalid email or password');
                error.statusCode = 400;
                throw error;
            }

            // Compare password using bcrypt
            const isMatch = await user.comparePassword(password);

            if (!isMatch) {
                const error = new Error('Invalid email or password');
                error.statusCode = 400;
                throw error;
            }

            // Generate JWT token
            const token = this.generateToken(user);

            // Return safe user object (without password) and token
            return {
                success: true,
                data: {
                    user: user.toSafeObject(),
                    token
                }
            };

        } catch (error) {
            // Preserve statusCode if set
            if (error.statusCode) {
                const newError = new Error(`Login failed: ${error.message}`);
                newError.statusCode = error.statusCode;
                throw newError;
            }
            throw new Error(`Login failed: ${error.message}`);
        }
    }

    /**
     * Generate JWT token for user
     * @param {Object} user - User object
     * @returns {string} JWT token
     */
    generateToken(user) {
        const payload = {
            userId: user._id,
            email: user.email,
            username: user.username,
            role: user.role
        };

        return jwt.sign(
            payload,
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRE
            }
        );
    }

    /**
     * Verify JWT token
     * @param {string} token - JWT token
     * @returns {Object} Decoded token payload
     */
    async verifyToken(token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Verify user still exists
            const user = await User.findById(decoded.userId);

            if (!user) {
                throw new Error('User no longer exists');
            }

            return {
                success: true,
                data: {
                    user: user.toSafeObject(),
                    decoded
                }
            };

        } catch (error) {
            if (error.name === 'JsonWebTokenError') {
                throw new Error('Invalid token');
            }
            if (error.name === 'TokenExpiredError') {
                throw new Error('Token expired');
            }
            throw new Error(`Token verification failed: ${error.message}`);
        }
    }

    /**
     * Get user by ID (for middleware)
     * @param {string} userId - User ID
     * @returns {Object} User object
     */
    async getUserById(userId) {
        try {
            const user = await User.findById(userId);

            if (!user) {
                throw new Error('User not found');
            }

            return {
                success: true,
                data: user.toSafeObject()
            };

        } catch (error) {
            throw new Error(`Failed to get user: ${error.message}`);
        }
    }
}

module.exports = new AuthService();
const jwt = require('jsonwebtoken');
const authService = require('../services/authService');

/**
 * Protect middleware - Verifies JWT token in Authorization header
 *
 * Expected header format: Authorization: Bearer <token>
 * Adds req.user object for downstream middleware/controllers
 */
const protect = async (req, res, next) => {
    try {
        // 1. Check if Authorization header exists
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                error: 'Access denied. No token provided.'
            });
        }

        // 2. Check if header follows 'Bearer <token>' format
        if (!authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Access denied. Invalid token format. Use: Bearer <token>'
            });
        }

        // 3. Extract token from header
        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Access denied. No token provided.'
            });
        }

        // 4. Verify token using auth service
        const verificationResult = await authService.verifyToken(token);

        if (!verificationResult.success) {
            return res.status(401).json({
                success: false,
                error: 'Access denied. Invalid token.'
            });
        }

        // 5. Attach user to request object for downstream use
        req.user = verificationResult.data.user;
        req.decoded = verificationResult.data.decoded;

        next();

    } catch (error) {
        // Handle JWT-specific errors
        if (error.message.includes('Token expired')) {
            return res.status(401).json({
                success: false,
                error: 'Access denied. Token has expired.'
            });
        }

        if (error.message.includes('Invalid token')) {
            return res.status(401).json({
                success: false,
                error: 'Access denied. Invalid token.'
            });
        }

        // Handle other authentication errors
        return res.status(401).json({
            success: false,
            error: 'Authentication failed.'
        });
    }
};

/**
 * Role-based authorization middleware
 *
 * @param {...string} roles - Allowed roles (admin, teacher, student)
 * @returns {Function} Middleware function
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        // Check if protect middleware was called first
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Access denied. Authentication required.'
            });
        }

        // Check if user role is authorized
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: `Access denied. Requires one of these roles: ${roles.join(', ')}`
            });
        }

        next();
    };
};

/**
 * Optional authentication middleware
 * Adds user to request if token is valid, but doesn't reject if no token
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // No token provided, continue without user
            return next();
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return next();
        }

        // Try to verify token
        const verificationResult = await authService.verifyToken(token);

        if (verificationResult.success) {
            req.user = verificationResult.data.user;
            req.decoded = verificationResult.data.decoded;
        }

        next();

    } catch (error) {
        // Ignore errors for optional auth, continue without user
        next();
    }
};

module.exports = {
    protect,
    authorize,
    optionalAuth
};
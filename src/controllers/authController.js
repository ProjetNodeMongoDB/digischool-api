const authService = require('../services/authService');

class AuthController {
    /**
     * Register a new user
     * POST /api/auth/register
     * Public endpoint (no authentication required)
     */
    async register(req, res, next) {
        try {
            const { username, email, password } = req.body;

            // Note: Role is not extracted from request for security
            // All new registrations default to 'student' role
            // Only admins can assign roles via admin endpoints

            // Call auth service to register user
            const result = await authService.register({
                username,
                email,
                password
                // role is omitted - will default to 'student' in User model
            });

            // Return success response with user and token
            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: result.data
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Login user
     * POST /api/auth/login
     * Public endpoint (no authentication required)
     */
    async login(req, res, next) {
        try {
            const { email, password } = req.body;

            // Call auth service to login user
            const result = await authService.login(email, password);

            // Return success response with user and token
            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: result.data
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Logout user (client-side token removal)
     * POST /api/auth/logout
     * Protected endpoint (requires authentication)
     *
     * Note: With JWT tokens, logout is handled client-side by removing the token.
     * This endpoint confirms the logout action.
     */
    async logout(req, res, next) {
        try {
            res.status(200).json({
                success: true,
                message: 'Logout successful. Please remove the token from client storage.'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all users (Admin only)
     * GET /api/auth/admin/users
     * Protected endpoint (requires admin authentication)
     */
    async getAllUsers(req, res, next) {
        try {
            const User = require('../models/User');
            const users = await User.find({})
                .select('-password')
                .sort({ createdAt: -1 });

            res.status(200).json({
                success: true,
                count: users.length,
                data: {
                    users
                }
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Update user role (Admin only)
     * PUT /api/auth/admin/users/:userId/role
     * Protected endpoint (requires admin authentication)
     */
    async updateUserRole(req, res, next) {
        try {
            const { userId } = req.params;
            const { role } = req.body;
            const adminId = req.user._id.toString();

            // Prevent self-role modification (security measure)
            if (userId === adminId) {
                return res.status(403).json({
                    success: false,
                    error: 'Cannot modify your own role for security reasons'
                });
            }

            // Find the user to update
            const User = require('../models/User');
            const targetUser = await User.findById(userId);

            if (!targetUser) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            // Store original role for audit log
            const originalRole = targetUser.role;

            // Update user role
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { role },
                {
                    new: true,
                    runValidators: true
                }
            ).select('-password');

            // Log the role change for audit purposes (suppress in test environment)
            if (process.env.NODE_ENV !== 'test') {
                console.log(`[AUDIT] Admin ${req.user.username} (${req.user._id}) changed user ${targetUser.username} (${userId}) role from ${originalRole} to ${role}`);
            }

            res.status(200).json({
                success: true,
                message: `User role updated from ${originalRole} to ${role}`,
                data: {
                    user: updatedUser.toSafeObject()
                }
            });

        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AuthController();
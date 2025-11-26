const express = require('express');
const { body, param } = require('express-validator');
const authController = require('../controllers/authController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validation');

const router = express.Router();

// Validation rules for user registration
const registerValidationRules = [
    body('username')
        .trim()
        .notEmpty()
        .withMessage('Username is required')
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_-]+$/)
        .withMessage('Username can only contain letters, numbers, hyphens, and underscores'),

    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),

    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

    body('role')
        .not()
        .exists()
        .withMessage('Role assignment is restricted. New users default to student role.')
];

// Validation rules for user login
const loginValidationRules = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),

    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

// Validation rules for profile update
const updateProfileValidationRules = [
    body('username')
        .optional()
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_-]+$/)
        .withMessage('Username can only contain letters, numbers, hyphens, and underscores'),

    body('email')
        .optional()
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),

    body('password')
        .not()
        .exists()
        .withMessage('Password updates are not allowed through this endpoint')
];

/**
 * Public Routes (No Authentication Required)
 */

// POST /api/auth/register - Register a new user
router.post('/register', registerValidationRules, validate, authController.register);

// POST /api/auth/login - Login user
router.post('/login', loginValidationRules, validate, authController.login);

/**
 * Protected Routes (Authentication Required)
 */

// POST /api/auth/logout - Logout user (client-side token removal)
router.post('/logout', protect, authController.logout);

/**
 * Admin-Only Routes (Role Management)
 */

// Validation rules for role updates
const roleUpdateValidationRules = [
    param('userId')
        .isMongoId()
        .withMessage('Invalid user ID format'),

    body('role')
        .trim()
        .notEmpty()
        .withMessage('Role is required')
        .isIn(['admin', 'teacher', 'student'])
        .withMessage('Role must be admin, teacher, or student')
];

// GET /api/auth/admin/users - Get all users (Admin only)
router.get('/admin/users',
    protect,
    authorize('admin'),
    authController.getAllUsers
);


// PUT /api/auth/admin/users/:userId/role - Update user role (Admin only)
router.put('/admin/users/:userId/role',
    protect,
    authorize('admin'),
    roleUpdateValidationRules,
    validate,
    authController.updateUserRole
);

module.exports = router;
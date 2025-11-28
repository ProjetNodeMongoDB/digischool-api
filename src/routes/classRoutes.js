const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const { body, param } = require('express-validator');
const { validate } = require('../middlewares/validation');
// const { protect } = require('../middlewares/authMiddleware'); // Add after Phase 4

/**
 * @swagger
 * tags:
 *   name: Classes
 *   description: Class management endpoints
 */

// Validation rules
const classValidationRules = [
  body('nom')
    .trim()
    .notEmpty().withMessage('Class name is required')
    .isLength({ max: 100 }).withMessage('Class name cannot exceed 100 characters'),
  body('prof')
    .notEmpty().withMessage('Teacher is required')
    .isMongoId().withMessage('Invalid teacher ID'),
];

const idValidation = [
  param('id').isMongoId().withMessage('Invalid class ID'),
];

/**
 * @swagger
 * /api/classes:
 *   get:
 *     summary: Get all classes
 *     tags: [Classes]
 *     responses:
 *       200:
 *         description: List of all classes with populated teacher info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Class'
 *       500:
 *         description: Server error
 *
 *   post:
 *     summary: Create a new class
 *     tags: [Classes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - prof
 *             properties:
 *               nom:
 *                 type: string
 *                 maxLength: 100
 *                 description: Class name (must be unique)
 *                 example: CM1-A
 *               prof:
 *                 type: string
 *                 description: MongoDB ObjectId of the teacher
 *                 example: 507f1f77bcf86cd799439011
 *     responses:
 *       201:
 *         description: Class created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Class'
 *       400:
 *         description: Validation error or duplicate class name
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/classes/{id}:
 *   get:
 *     summary: Get class by ID
 *     tags: [Classes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the class
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Class details with populated teacher info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Class'
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Class not found
 *       500:
 *         description: Server error
 *
 *   put:
 *     summary: Update class by ID
 *     tags: [Classes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the class
 *         example: 507f1f77bcf86cd799439011
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *                 maxLength: 100
 *                 description: Class name (must be unique)
 *                 example: CM1-A
 *               prof:
 *                 type: string
 *                 description: MongoDB ObjectId of the teacher
 *                 example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Class updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Class'
 *       400:
 *         description: Validation error or invalid ID
 *       404:
 *         description: Class not found
 *       500:
 *         description: Server error
 *
 *   delete:
 *     summary: Delete class by ID
 *     tags: [Classes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the class
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Class deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Class deleted successfully
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Class not found
 *       500:
 *         description: Server error
 */

// Routes (temporarily without auth - add protect middleware in Phase 4)
router.get('/', classController.getAll);
router.get('/:id', idValidation, validate, classController.getById);
router.post('/', classValidationRules, validate, classController.create);
router.put('/:id', idValidation, classValidationRules, validate, classController.update);
router.delete('/:id', idValidation, validate, classController.delete);

module.exports = router;

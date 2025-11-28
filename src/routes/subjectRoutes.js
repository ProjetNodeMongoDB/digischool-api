const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');
const { body, param } = require('express-validator');
const { validate } = require('../middlewares/validation');
const { protect, authorize } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Subjects
 *   description: Subject management endpoints
 */

// Validation rules
const subjectValidationRules = [
	body('nom')
		.trim()
		.notEmpty()
		.withMessage('Subject name is required')
		.isLength({ max: 250 })
		.withMessage('Subject name cannot exceed 250 characters'),
];

const idValidation = [
	param('id').isMongoId().withMessage('Invalid subject ID'),
];
/**
 * @swagger
 * /api/subjects:
 *   get:
 *     summary: Get all subjects
 *     tags: [Subjects]
 *     responses:
 *       200:
 *         description: List of all subjects
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
 *                   example: 8
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Subject'
 *       500:
 *         description: Server error
 *
 *   post:
 *     summary: Create a new subject
 *     tags: [Subjects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *             properties:
 *               nom:
 *                 type: string
 *                 maxLength: 250
 *                 description: Subject name (must be unique)
 *                 example: Mathématiques
 *     responses:
 *       201:
 *         description: Subject created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Subject'
 *       400:
 *         description: Validation error or duplicate subject name
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/subjects/{id}:
 *   get:
 *     summary: Get subject by ID
 *     tags: [Subjects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the subject
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Subject details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Subject'
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Subject not found
 *       500:
 *         description: Server error
 *
 *   put:
 *     summary: Update subject by ID
 *     tags: [Subjects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the subject
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
 *                 maxLength: 250
 *                 description: Subject name (must be unique)
 *                 example: Mathématiques
 *     responses:
 *       200:
 *         description: Subject updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Subject'
 *       400:
 *         description: Validation error or invalid ID
 *       404:
 *         description: Subject not found
 *       500:
 *         description: Server error
 *
 *   delete:
 *     summary: Delete subject by ID
 *     tags: [Subjects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the subject
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Subject deleted successfully
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
 *                   example: Subject deleted successfully
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Subject not found
 *       500:
 *         description: Server error
 */

// Routes with JWT authentication
router.get('/', protect, subjectController.getAll);
router.get('/:id', protect, idValidation, validate, subjectController.getById);
router.post('/', protect, authorize('admin'), subjectValidationRules, validate, subjectController.create);
router.put('/:id', protect, authorize('admin'), idValidation, subjectValidationRules, validate, subjectController.update);
router.delete('/:id', protect, authorize('admin'), idValidation, validate, subjectController.delete);


module.exports = router;

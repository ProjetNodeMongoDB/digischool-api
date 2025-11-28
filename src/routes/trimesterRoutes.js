const express = require('express');
const router = express.Router();
const trimesterController = require('../controllers/trimesterController');
const { body, param } = require('express-validator');
const { validate } = require('../middlewares/validation');
// const { protect } = require('../middlewares/authMiddleware'); // Add after Phase 4

/**
 * @swagger
 * tags:
 *   name: Trimesters
 *   description: Trimester management endpoints
 */

// Validation rules
const trimesterValidationRules = [
  body('nom')
    .trim()
    .notEmpty().withMessage('Trimester name is required')
    .isLength({ max: 10 }).withMessage('Trimester name cannot exceed 10 characters'),
  body('date')
    .notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Invalid date format'),
];

const idValidation = [
  param('id').isMongoId().withMessage('Invalid trimester ID'),
];

/**
 * @swagger
 * /api/trimesters:
 *   get:
 *     summary: Get all trimesters
 *     tags: [Trimesters]
 *     responses:
 *       200:
 *         description: List of all trimesters
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
 *                   example: 3
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Trimester'
 *       500:
 *         description: Server error
 *
 *   post:
 *     summary: Create a new trimester
 *     tags: [Trimesters]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - date
 *             properties:
 *               nom:
 *                 type: string
 *                 maxLength: 10
 *                 description: Trimester name
 *                 example: T1
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Trimester date
 *                 example: 2024-01-01
 *     responses:
 *       201:
 *         description: Trimester created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Trimester'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/trimesters/{id}:
 *   get:
 *     summary: Get trimester by ID
 *     tags: [Trimesters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the trimester
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Trimester details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Trimester'
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Trimester not found
 *       500:
 *         description: Server error
 *
 *   put:
 *     summary: Update trimester by ID
 *     tags: [Trimesters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the trimester
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
 *                 maxLength: 10
 *                 description: Trimester name
 *                 example: T1
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Trimester date
 *                 example: 2024-01-01
 *     responses:
 *       200:
 *         description: Trimester updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Trimester'
 *       400:
 *         description: Validation error or invalid ID
 *       404:
 *         description: Trimester not found
 *       500:
 *         description: Server error
 *
 *   delete:
 *     summary: Delete trimester by ID
 *     tags: [Trimesters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the trimester
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Trimester deleted successfully
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
 *                   example: Trimester deleted successfully
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Trimester not found
 *       500:
 *         description: Server error
 */

// Routes (temporarily without auth - add protect middleware in Phase 4)
router.get('/', trimesterController.getAll);
router.get('/:id', idValidation, validate, trimesterController.getById);
router.post('/', trimesterValidationRules, validate, trimesterController.create);
router.put('/:id', idValidation, trimesterValidationRules, validate, trimesterController.update);
router.delete('/:id', idValidation, validate, trimesterController.delete);

module.exports = router;

const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { body, param, query } = require('express-validator');
const { validate } = require('../middlewares/validation');
const { protect, authorize } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Students
 *   description: Student management endpoints
 */

// Validation rules
const studentValidationRules = [
  body('nom')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ max: 100 }).withMessage('Last name cannot exceed 100 characters'),
  body('prenom')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ max: 100 }).withMessage('First name cannot exceed 100 characters'),
  body('classe')
    .notEmpty().withMessage('Class is required')
    .isMongoId().withMessage('Invalid class ID'),
  body('dateNaissance')
    .notEmpty().withMessage('Birth date is required')
    .isISO8601().withMessage('Invalid date format')
    .custom((value) => {
      if (new Date(value) >= new Date()) {
        throw new Error('Birth date must be in the past');
      }
      return true;
    }),
  body('adresse')
    .optional()
    .trim()
    .isLength({ max: 250 }).withMessage('Address cannot exceed 250 characters'),
  body('sexe')
    .notEmpty().withMessage('Gender is required')
    .isIn(['HOMME', 'FEMME']).withMessage('Gender must be HOMME or FEMME'),
];

const idValidation = [
  param('id').isMongoId().withMessage('Invalid student ID'),
];

/**
 * @swagger
 * /api/students:
 *   get:
 *     summary: Get all students
 *     tags: [Students]
 *     responses:
 *       200:
 *         description: List of all students with populated class info
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
 *                   example: 10
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Student'
 *       500:
 *         description: Server error
 *
 *   post:
 *     summary: Create a new student
 *     tags: [Students]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - prenom
 *               - sexe
 *               - dateNaissance
 *               - classe
 *             properties:
 *               nom:
 *                 type: string
 *                 maxLength: 100
 *                 example: Martin
 *               prenom:
 *                 type: string
 *                 maxLength: 100
 *                 example: Sophie
 *               sexe:
 *                 type: string
 *                 enum: [HOMME, FEMME]
 *                 example: FEMME
 *               dateNaissance:
 *                 type: string
 *                 format: date
 *                 example: 2010-03-20
 *               classe:
 *                 type: string
 *                 description: MongoDB ObjectId of the class
 *                 example: 507f1f77bcf86cd799439011
 *               adresse:
 *                 type: string
 *                 maxLength: 250
 *                 example: 456 Avenue des Champs, 75008 Paris
 *     responses:
 *       201:
 *         description: Student created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Student'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/students/{id}:
 *   get:
 *     summary: Get student by ID
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the student
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Student details with populated class info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Student'
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Student not found
 *       500:
 *         description: Server error
 *
 *   put:
 *     summary: Update student by ID
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the student
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
 *                 example: Martin
 *               prenom:
 *                 type: string
 *                 maxLength: 100
 *                 example: Sophie
 *               sexe:
 *                 type: string
 *                 enum: [HOMME, FEMME]
 *                 example: FEMME
 *               dateNaissance:
 *                 type: string
 *                 format: date
 *                 example: 2010-03-20
 *               classe:
 *                 type: string
 *                 description: MongoDB ObjectId of the class
 *                 example: 507f1f77bcf86cd799439011
 *               adresse:
 *                 type: string
 *                 maxLength: 250
 *                 example: 456 Avenue des Champs, 75008 Paris
 *     responses:
 *       200:
 *         description: Student updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Student'
 *       400:
 *         description: Validation error or invalid ID
 *       404:
 *         description: Student not found
 *       500:
 *         description: Server error
 *
 *   delete:
 *     summary: Delete student by ID
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the student
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Student deleted successfully
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
 *                   example: Student deleted successfully
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Student not found
 *       500:
 *         description: Server error
 */

// Routes with authentication
router.get('/', protect, filterValidation, validate, studentController.getAll);
router.get('/:id', protect, idValidation, validate, studentController.getById);
router.post('/', protect, authorize('admin'), studentValidationRules, validate, studentController.create);
router.put('/:id', protect, authorize('admin'), idValidation, studentValidationRules, validate, studentController.update);
router.delete('/:id', protect, authorize('admin'), idValidation, validate, studentController.delete);

module.exports = router;

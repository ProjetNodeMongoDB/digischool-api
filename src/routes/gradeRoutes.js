const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/gradeController');
const { body, param, query } = require('express-validator');
const { validate } = require('../middlewares/validation');
// const { protect } = require('../middlewares/authMiddleware'); // Add after Phase 4

/**
 * @swagger
 * tags:
 *   name: Grades
 *   description: Grade management endpoints
 */

// Validation rules for creating/updating grades
const gradeValidationRules = [
  body('ideleve')
    .notEmpty().withMessage('Student ID is required')
    .isMongoId().withMessage('Invalid student ID format'),
  body('idclasse')
    .notEmpty().withMessage('Class ID is required')
    .isMongoId().withMessage('Invalid class ID format'),
  body('idmatiere')
    .notEmpty().withMessage('Subject ID is required')
    .isMongoId().withMessage('Invalid subject ID format'),
  body('idprof')
    .notEmpty().withMessage('Teacher ID is required')
    .isMongoId().withMessage('Invalid teacher ID format'),
  body('idtrimestre')
    .notEmpty().withMessage('Trimester ID is required')
    .isMongoId().withMessage('Invalid trimester ID format'),
  body('note')
    .notEmpty().withMessage('Note is required')
    .isFloat({ min: 0, max: 20 }).withMessage('Note must be between 0 and 20'),
  body('coefficient')
    .notEmpty().withMessage('Coefficient is required')
    .isFloat({ min: 0 }).withMessage('Coefficient must be positive')
];

// Validation for ID param
const idValidation = [
  param('id').isMongoId().withMessage('Invalid grade ID')
];

// Validation for query filters (optional)
const filterValidation = [
  query('student').optional().isMongoId().withMessage('Invalid student ID'),
  query('class').optional().isMongoId().withMessage('Invalid class ID'),
  query('subject').optional().isMongoId().withMessage('Invalid subject ID'),
  query('trimester').optional().isMongoId().withMessage('Invalid trimester ID')
];

/**
 * @swagger
 * /api/grades:
 *   get:
 *     summary: Get all grades with optional filters
 *     tags: [Grades]
 *     description: Retrieve all grades. Supports filtering by student, class, subject, or trimester.
 *     parameters:
 *       - in: query
 *         name: student
 *         schema:
 *           type: string
 *         description: Filter by student ObjectId
 *         example: 507f1f77bcf86cd799439011
 *       - in: query
 *         name: class
 *         schema:
 *           type: string
 *         description: Filter by class ObjectId
 *         example: 507f1f77bcf86cd799439012
 *       - in: query
 *         name: subject
 *         schema:
 *           type: string
 *         description: Filter by subject ObjectId
 *         example: 507f1f77bcf86cd799439013
 *       - in: query
 *         name: trimester
 *         schema:
 *           type: string
 *         description: Filter by trimester ObjectId
 *         example: 507f1f77bcf86cd799439015
 *     responses:
 *       200:
 *         description: List of all grades (filtered if query params provided)
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
 *                     $ref: '#/components/schemas/Grade'
 *       400:
 *         description: Invalid filter parameters
 *       500:
 *         description: Server error
 *
 *   post:
 *     summary: Create a new grade
 *     tags: [Grades]
 *     description: Create a new grade with references to student, class, subject, teacher, and trimester
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ideleve
 *               - idclasse
 *               - idmatiere
 *               - idprof
 *               - idtrimestre
 *               - note
 *               - coefficient
 *             properties:
 *               ideleve:
 *                 type: string
 *                 description: Student ObjectId
 *                 example: 507f1f77bcf86cd799439011
 *               idclasse:
 *                 type: string
 *                 description: Class ObjectId
 *                 example: 507f1f77bcf86cd799439012
 *               idmatiere:
 *                 type: string
 *                 description: Subject ObjectId
 *                 example: 507f1f77bcf86cd799439013
 *               idprof:
 *                 type: string
 *                 description: Teacher ObjectId
 *                 example: 507f1f77bcf86cd799439014
 *               idtrimestre:
 *                 type: string
 *                 description: Trimester ObjectId
 *                 example: 507f1f77bcf86cd799439015
 *               note:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 maximum: 20
 *                 description: Grade score (0-20)
 *                 example: 15.5
 *               coefficient:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 description: Grade coefficient
 *                 example: 2
 *     responses:
 *       201:
 *         description: Grade created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Grade'
 *       400:
 *         description: Validation error or invalid references
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/grades/{id}:
 *   get:
 *     summary: Get grade by ID
 *     tags: [Grades]
 *     description: Retrieve a specific grade with all populated references
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the grade
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Grade details with populated references
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Grade'
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Grade not found
 *       500:
 *         description: Server error
 *
 *   put:
 *     summary: Update grade by ID
 *     tags: [Grades]
 *     description: Update an existing grade
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the grade
 *         example: 507f1f77bcf86cd799439011
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ideleve
 *               - idclasse
 *               - idmatiere
 *               - idprof
 *               - idtrimestre
 *               - note
 *               - coefficient
 *             properties:
 *               ideleve:
 *                 type: string
 *                 description: Student ObjectId
 *                 example: 507f1f77bcf86cd799439011
 *               idclasse:
 *                 type: string
 *                 description: Class ObjectId
 *                 example: 507f1f77bcf86cd799439012
 *               idmatiere:
 *                 type: string
 *                 description: Subject ObjectId
 *                 example: 507f1f77bcf86cd799439013
 *               idprof:
 *                 type: string
 *                 description: Teacher ObjectId
 *                 example: 507f1f77bcf86cd799439014
 *               idtrimestre:
 *                 type: string
 *                 description: Trimester ObjectId
 *                 example: 507f1f77bcf86cd799439015
 *               note:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 maximum: 20
 *                 description: Grade score (0-20)
 *                 example: 15.5
 *               coefficient:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 description: Grade coefficient
 *                 example: 2
 *     responses:
 *       200:
 *         description: Grade updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Grade'
 *       400:
 *         description: Validation error or invalid ID
 *       404:
 *         description: Grade not found
 *       500:
 *         description: Server error
 *
 *   delete:
 *     summary: Delete grade by ID
 *     tags: [Grades]
 *     description: Delete a specific grade
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the grade
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Grade deleted successfully
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
 *                   example: Grade deleted successfully
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Grade not found
 *       500:
 *         description: Server error
 */

// Routes (temporarily without auth - add protect middleware in Phase 4)
router.get('/', filterValidation, validate, gradeController.getAll);
router.get('/:id', idValidation, validate, gradeController.getById);
router.post('/', gradeValidationRules, validate, gradeController.create);
router.put('/:id', idValidation, gradeValidationRules, validate, gradeController.update);
router.delete('/:id', idValidation, validate, gradeController.delete);

module.exports = router;

const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/gradeController');
const { body, param, query } = require('express-validator');
const { validate } = require('../middlewares/validation');
const { protect, authorize } = require('../middlewares/authMiddleware');

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
  query('trimester').optional().isMongoId().withMessage('Invalid trimester ID'),
  query('groupBy')
    .optional()
    .isIn(['subject'])
    .withMessage('Invalid groupBy value. Allowed: subject')
];

// Validation for teacher ID parameter
const teacherIdValidation = [
  param('teacherId').isMongoId().withMessage('Invalid teacher ID')
];

/**
 * @swagger
 * /api/grades/teachers/{teacherId}/students-grades:
 *   get:
 *     summary: Get all students with their grades for a specific teacher
 *     tags: [Grades]
 *     description: Retrieve all students taught by a teacher with their respective grades grouped by student
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the teacher
 *         example: 507f1f77bcf86cd799439014
 *     responses:
 *       200:
 *         description: List of students with their grades
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
 *                     type: object
 *       400:
 *         description: Invalid teacher ID format
 *       404:
 *         description: Teacher not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/grades:
 *   get:
 *     summary: Get all grades with optional filters
 *     tags: [Grades]
 *     description: |
 *       Retrieve all grades with optional filtering and grouping.
 *
 *       **Default behavior (flat list):**
 *       Returns a flat array of grades with all populated references.
 *       Supports filtering by student, class, subject, or trimester.
 *
 *       **Grouped by subject (groupBy=subject):**
 *       Returns grades organized by subject for academic report generation.
 *       Each subject contains all student grades with teacher information, sorted alphabetically by student last name.
 *       Supports optional class and trimester filters (student/subject filters are ignored in grouped mode).
 *     parameters:
 *       - in: query
 *         name: student
 *         schema:
 *           type: string
 *         description: Filter by student ObjectId (flat list only)
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
 *         description: Filter by subject ObjectId (flat list only)
 *         example: 507f1f77bcf86cd799439013
 *       - in: query
 *         name: trimester
 *         schema:
 *           type: string
 *         description: Filter by trimester ObjectId
 *         example: 507f1f77bcf86cd799439015
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: string
 *           enum: [subject]
 *         description: Group results by subject for academic reports
 *         example: subject
 *     responses:
 *       200:
 *         description: |
 *           List of grades (flat or grouped based on groupBy parameter).
 *
 *           **Flat response:** Array of grade objects with populated references
 *
 *           **Grouped response:** Array of subjects, each containing grades array
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
 *                   description: Number of grades (flat) or number of subjects (grouped)
 *                 totalGrades:
 *                   type: integer
 *                   example: 45
 *                   description: Total number of grades (only in grouped response)
 *                 data:
 *                   oneOf:
 *                     - type: array
 *                       items:
 *                         $ref: '#/components/schemas/Grade'
 *                     - type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           subject:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: 507f1f77bcf86cd799439013
 *                               nom:
 *                                 type: string
 *                                 example: Mathematics
 *                           grades:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 student:
 *                                   type: object
 *                                   properties:
 *                                     nom:
 *                                       type: string
 *                                       example: Martin
 *                                     prenom:
 *                                       type: string
 *                                       example: Sophie
 *                                 note:
 *                                   type: number
 *                                   example: 15
 *                                 coefficient:
 *                                   type: number
 *                                   example: 2
 *                                 teacher:
 *                                   type: object
 *                                   properties:
 *                                     nom:
 *                                       type: string
 *                                       example: Dupont
 *                                     prenom:
 *                                       type: string
 *                                       example: Jean
 *       400:
 *         description: Invalid filter parameters or groupBy value
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

// Routes with authentication
// Teacher's students-grades endpoint - specific routes before generic ones
router.get('/teachers/:teacherId/students-grades', protect, teacherIdValidation, validate, gradeController.getStudentsByTeacher);

// Standard grade CRUD endpoints
router.get('/', protect, filterValidation, validate, gradeController.getAll);
router.get('/:id', protect, idValidation, validate, gradeController.getById);
router.post('/', protect, authorize('admin', 'teacher'), gradeValidationRules, validate, gradeController.create);
router.put('/:id', protect, authorize('admin', 'teacher'), idValidation, gradeValidationRules, validate, gradeController.update);
router.delete('/:id', protect, authorize('admin'), idValidation, validate, gradeController.delete);

module.exports = router;

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

// Validation for query filter (optional classe and groupBy parameters)
const filterValidation = [
  query('classe').optional().isMongoId().withMessage('Invalid class ID'),
  query('groupBy')
    .optional()
    .isIn(['class'])
    .withMessage('Invalid groupBy value. Allowed: class')
];

/**
 * @swagger
 * /api/students:
 *   get:
 *     summary: Get all students with optional filtering and grouping
 *     tags: [Students]
 *     description: |
 *       Retrieve all students with optional filtering and grouping capabilities.
 *
 *       **Default behavior (flat list):**
 *       Returns a flat array of all students.
 *
 *       **Filter by class (classe parameter):**
 *       Returns students belonging to a specific class.
 *
 *       **Grouped by class (groupBy=class):**
 *       Returns students organized by their classes for academic reporting.
 *       Each class contains all its students, sorted alphabetically by student last name.
 *     parameters:
 *       - in: query
 *         name: classe
 *         schema:
 *           type: string
 *         description: Filter by class ObjectId (ignored when using groupBy)
 *         example: 507f1f77bcf86cd799439011
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: string
 *           enum: [class]
 *         description: Group results by class for academic reports
 *         example: class
 *     responses:
 *       200:
 *         description: |
 *           List of students (flat or grouped based on groupBy parameter).
 *
 *           **Flat response:** Array of student objects
 *
 *           **Grouped response:** Array of classes, each containing students array
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
 *                   description: Number of students (flat) or number of classes (grouped)
 *                 totalStudents:
 *                   type: integer
 *                   example: 45
 *                   description: Total number of students (only in grouped response)
 *                 data:
 *                   oneOf:
 *                     - type: array
 *                       items:
 *                         $ref: '#/components/schemas/Student'
 *                     - type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           class:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: 507f1f77bcf86cd799439011
 *                               nom:
 *                                 type: string
 *                                 example: CM1
 *                               prof:
 *                                 type: object
 *                                 properties:
 *                                   nom:
 *                                     type: string
 *                                     example: Dupont
 *                                   prenom:
 *                                     type: string
 *                                     example: Jean
 *                           students:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 _id:
 *                                   type: string
 *                                 nom:
 *                                   type: string
 *                                 prenom:
 *                                   type: string
 *                                 dateNaissance:
 *                                   type: string
 *                                   format: date
 *                                 sexe:
 *                                   type: string
 *                                 adresse:
 *                                   type: string
 *       400:
 *         description: Invalid filter parameters or groupBy value
 *       404:
 *         description: Class not found (when filtering by class)
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

/**
 * @swagger
 * /api/students:
 *   get:
 *     summary: Get all students or filter by class
 *     tags: [Students]
 *     parameters:
 *       - in: query
 *         name: classe
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the class to filter students
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: List of all students (or filtered by class) with populated class and teacher info
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
 *       404:
 *         description: Class not found (when filtering by class)
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

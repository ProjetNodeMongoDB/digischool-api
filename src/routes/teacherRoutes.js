const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const gradeController = require('../controllers/gradeController');
const { body, param, query } = require('express-validator');
const { validate } = require('../middlewares/validation');
const { protect, authorize } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Teachers
 *   description: Teacher management endpoints
 */

// Validation rules
const teacherValidationRules = [
  body('nom')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ max: 100 }).withMessage('Last name cannot exceed 100 characters'),
  body('prenom')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ max: 100 }).withMessage('First name cannot exceed 100 characters'),
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
  param('id').isMongoId().withMessage('Invalid teacher ID'),
];

const classeQueryValidation = [
  query('classe')
    .optional()
    .isMongoId().withMessage('Invalid class ID'),
];

const teacherIdValidation = [
  param('teacherId').isMongoId().withMessage('Invalid teacher ID'),
];

/**
 * @swagger
 * /api/teachers/{teacherId}/students-grades:
 *   get:
 *     summary: Get students with their grades for a specific teacher
 *     tags: [Teachers]
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
 *                   description: Number of students
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       student:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 507f1f77bcf86cd799439011
 *                           nom:
 *                             type: string
 *                             example: Dupont
 *                           prenom:
 *                             type: string
 *                             example: Jean
 *                           dateNaissance:
 *                             type: string
 *                             format: date
 *                             example: 2010-05-15
 *                       grades:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                               example: 608f1f77bcf86cd799439022
 *                             note:
 *                               type: number
 *                               example: 15.5
 *                             coefficient:
 *                               type: number
 *                               example: 2
 *                             matiere:
 *                               type: object
 *                               properties:
 *                                 _id:
 *                                   type: string
 *                                 nom:
 *                                   type: string
 *                                   example: Mathématiques
 *                             trimestre:
 *                               type: object
 *                               properties:
 *                                 _id:
 *                                   type: string
 *                                 nom:
 *                                   type: string
 *                                   example: Trimestre 1
 *                             classe:
 *                               type: object
 *                               properties:
 *                                 _id:
 *                                   type: string
 *                                 nom:
 *                                   type: string
 *                                   example: CM1
 *                             createdAt:
 *                               type: string
 *                               format: date-time
 *       400:
 *                         description: Invalid teacher ID format
 *       404:
 *         description: Teacher not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/teachers:
 *   get:
 *     summary: Get all teachers or filter by class
 *     tags: [Teachers]
 *     parameters:
 *       - in: query
 *         name: classe
 *         schema:
 *           type: string
 *         description: Optional MongoDB ObjectId of the class to filter teachers
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: List of all teachers or teachers assigned to a specific class
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
 *                     $ref: '#/components/schemas/Teacher'
 *       400:
 *         description: Invalid class ID format
 *       404:
 *         description: Class not found
 *       500:
 *         description: Server error
 *
 *   post:
 *     summary: Create a new teacher
 *     tags: [Teachers]
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
 *             properties:
 *               nom:
 *                 type: string
 *                 maxLength: 100
 *                 example: Dupont
 *               prenom:
 *                 type: string
 *                 maxLength: 100
 *                 example: Jean
 *               sexe:
 *                 type: string
 *                 enum: [HOMME, FEMME]
 *                 example: HOMME
 *               dateNaissance:
 *                 type: string
 *                 format: date
 *                 example: 1980-05-15
 *               adresse:
 *                 type: string
 *                 maxLength: 250
 *                 example: 123 Rue de Paris, 75001 Paris
 *     responses:
 *       201:
 *         description: Teacher created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Teacher'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/teachers/{id}:
 *   get:
 *     summary: Get teacher by ID
 *     tags: [Teachers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the teacher
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Teacher details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Teacher'
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Teacher not found
 *       500:
 *         description: Server error
 *
 *   put:
 *     summary: Update teacher by ID
 *     tags: [Teachers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the teacher
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
 *                 example: Dupont
 *               prenom:
 *                 type: string
 *                 maxLength: 100
 *                 example: Jean
 *               sexe:
 *                 type: string
 *                 enum: [HOMME, FEMME]
 *                 example: HOMME
 *               dateNaissance:
 *                 type: string
 *                 format: date
 *                 example: 1980-05-15
 *               adresse:
 *                 type: string
 *                 maxLength: 250
 *                 example: 123 Rue de Paris, 75001 Paris
 *     responses:
 *       200:
 *         description: Teacher updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Teacher'
 *       400:
 *         description: Validation error or invalid ID
 *       404:
 *         description: Teacher not found
 *       500:
 *         description: Server error
 *
 *   delete:
 *     summary: Delete teacher by ID
 *     tags: [Teachers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the teacher
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Teacher deleted successfully
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
 *                   example: Teacher deleted successfully
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Teacher not found
 *       500:
 *         description: Server error
 */

// Routes with authentication
router.get('/', protect, classeQueryValidation, validate, teacherController.getAll);
router.get('/:teacherId/students-grades', protect, teacherIdValidation, validate, gradeController.getStudentsByTeacher);
router.get('/:id', protect, idValidation, validate, teacherController.getById);
router.post('/', protect, authorize('admin'), teacherValidationRules, validate, teacherController.create);
router.put('/:id', protect, authorize('admin'), idValidation, teacherValidationRules, validate, teacherController.update);
router.delete('/:id', protect, authorize('admin'), idValidation, validate, teacherController.delete);

module.exports = router;

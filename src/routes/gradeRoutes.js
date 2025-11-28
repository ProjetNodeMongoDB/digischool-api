const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/gradeController');
const { body, param, query } = require('express-validator');
const { validate } = require('../middlewares/validation');
const { protect, authorize } = require('../middlewares/authMiddleware');

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

// Routes with authentication
router.get('/', protect, filterValidation, validate, gradeController.getAll);
router.get('/:id', protect, idValidation, validate, gradeController.getById);
router.post('/', protect, authorize('admin', 'teacher'), gradeValidationRules, validate, gradeController.create);
router.put('/:id', protect, authorize('admin', 'teacher'), idValidation, gradeValidationRules, validate, gradeController.update);
router.delete('/:id', protect, authorize('admin'), idValidation, validate, gradeController.delete);

module.exports = router;

const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { body, param, query } = require('express-validator');
const { validate } = require('../middlewares/validation');
const { protect, authorize } = require('../middlewares/authMiddleware');

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

const filterValidation = [
  query('classe').optional().isMongoId().withMessage('Invalid class ID format'),
];

// Routes with authentication
router.get('/', protect, filterValidation, validate, studentController.getAll);
router.get('/:id', protect, idValidation, validate, studentController.getById);
router.post('/', protect, authorize('admin'), studentValidationRules, validate, studentController.create);
router.put('/:id', protect, authorize('admin'), idValidation, studentValidationRules, validate, studentController.update);
router.delete('/:id', protect, authorize('admin'), idValidation, validate, studentController.delete);

module.exports = router;

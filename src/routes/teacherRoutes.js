const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { body, param } = require('express-validator');
const { validate } = require('../middlewares/validation');
const { protect } = require('../middlewares/authMiddleware');

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

// Routes
router.get('/', teacherController.getAll); // Public - list all teachers
router.get('/:id', protect, idValidation, validate, teacherController.getById);
router.post('/', protect, teacherValidationRules, validate, teacherController.create);
router.put('/:id', protect, idValidation, teacherValidationRules, validate, teacherController.update);
router.delete('/:id', protect, idValidation, validate, teacherController.delete);

module.exports = router;

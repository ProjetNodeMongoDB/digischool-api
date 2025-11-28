const express = require('express');
const router = express.Router();
const trimesterController = require('../controllers/trimesterController');
const { body, param } = require('express-validator');
const { validate } = require('../middlewares/validation');
const { protect, authorize } = require('../middlewares/authMiddleware');

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

// Routes with authentication
router.get('/', protect, trimesterController.getAll);
router.get('/:id', protect, idValidation, validate, trimesterController.getById);
router.post('/', protect, authorize('admin'), trimesterValidationRules, validate, trimesterController.create);
router.put('/:id', protect, authorize('admin'), idValidation, trimesterValidationRules, validate, trimesterController.update);
router.delete('/:id', protect, authorize('admin'), idValidation, validate, trimesterController.delete);

module.exports = router;

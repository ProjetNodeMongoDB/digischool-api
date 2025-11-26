const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const { body, param } = require('express-validator');
const { validate } = require('../middlewares/validation');
const { protect } = require('../middlewares/authMiddleware');

// Validation rules
const classValidationRules = [
  body('nom')
    .trim()
    .notEmpty().withMessage('Class name is required')
    .isLength({ max: 100 }).withMessage('Class name cannot exceed 100 characters'),
  body('prof')
    .notEmpty().withMessage('Teacher is required')
    .isMongoId().withMessage('Invalid teacher ID'),
];

const idValidation = [
  param('id').isMongoId().withMessage('Invalid class ID'),
];

// Routes with authentication
router.get('/', protect, classController.getAll);
router.get('/:id', protect, idValidation, validate, classController.getById);
router.post('/', protect, classValidationRules, validate, classController.create);
router.put('/:id', protect, idValidation, classValidationRules, validate, classController.update);
router.delete('/:id', protect, idValidation, validate, classController.delete);

module.exports = router;

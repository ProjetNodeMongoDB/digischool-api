const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const { body, param } = require('express-validator');
const { validate } = require('../middlewares/validation');
// const { protect } = require('../middlewares/authMiddleware'); // Add after Phase 4

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

// Routes (temporarily without auth - add protect middleware in Phase 4)
router.get('/', classController.getAll);
router.get('/:id', idValidation, validate, classController.getById);
router.post('/', classValidationRules, validate, classController.create);
router.put('/:id', idValidation, classValidationRules, validate, classController.update);
router.delete('/:id', idValidation, validate, classController.delete);

module.exports = router;

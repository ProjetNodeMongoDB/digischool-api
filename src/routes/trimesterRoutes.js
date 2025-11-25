const express = require('express');
const router = express.Router();
const trimesterController = require('../controllers/trimesterController');
const { body, param } = require('express-validator');
const { validate } = require('../middlewares/validation');
// const { protect } = require('../middlewares/authMiddleware'); // Add after Phase 4

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

// Routes (temporarily without auth - add protect middleware in Phase 4)
router.get('/', trimesterController.getAll);
router.get('/:id', idValidation, validate, trimesterController.getById);
router.post('/', trimesterValidationRules, validate, trimesterController.create);
router.put('/:id', idValidation, trimesterValidationRules, validate, trimesterController.update);
router.delete('/:id', idValidation, validate, trimesterController.delete);

module.exports = router;

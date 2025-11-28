const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');
const { body, param } = require('express-validator');
const { validate } = require('../middlewares/validation');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Validation rules
const subjectValidationRules = [
	body('nom')
		.trim()
		.notEmpty()
		.withMessage('Subject name is required')
		.isLength({ max: 250 })
		.withMessage('Subject name cannot exceed 250 characters'),
];

const idValidation = [
	param('id').isMongoId().withMessage('Invalid subject ID'),
];

// Routes with JWT authentication
router.get('/', protect, subjectController.getAll);
router.get('/:id', protect, idValidation, validate, subjectController.getById);
router.post('/', protect, authorize('admin'), subjectValidationRules, validate, subjectController.create);
router.put('/:id', protect, authorize('admin'), idValidation, subjectValidationRules, validate, subjectController.update);
router.delete('/:id', protect, authorize('admin'), idValidation, validate, subjectController.delete);

module.exports = router;

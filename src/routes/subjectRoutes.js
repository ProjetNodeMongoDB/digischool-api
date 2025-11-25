const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');
const { body, param } = require('express-validator');
const { validate } = require('../middlewares/validation');
// const { protect } = require('../middlewares/authMiddleware'); // Add after Phase 4

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

// Routes (temporarily without auth - add protect middleware in Phase 4)
router.get('/', subjectController.getAll);
router.get('/:id', idValidation, validate, subjectController.getById);
router.post('/', subjectValidationRules, validate, subjectController.create);
router.put(
	'/:id',
	idValidation,
	subjectValidationRules,
	validate,
	subjectController.update
);
router.delete('/:id', idValidation, validate, subjectController.delete);

module.exports = router;

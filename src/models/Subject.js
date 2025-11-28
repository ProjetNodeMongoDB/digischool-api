const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Subject:
 *       type: object
 *       required:
 *         - nom
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *           example: 507f1f77bcf86cd799439011
 *         nom:
 *           type: string
 *           maxLength: 250
 *           description: Subject name (must be unique)
 *           example: Mathématiques
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 */

const subjectSchema = new mongoose.Schema(
	{
		nom: {
			type: String,
			required: [true, 'Subject name is required'],
			unique: true,
			trim: true,
			maxlength: [250, 'Subject name cannot exceed 250 characters'],
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model('Subject', subjectSchema);

const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Class:
 *       type: object
 *       required:
 *         - nom
 *         - prof
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *           example: 507f1f77bcf86cd799439011
 *         nom:
 *           type: string
 *           maxLength: 100
 *           description: Class name (must be unique)
 *           example: CM1-A
 *         prof:
 *           type: string
 *           description: Reference to Teacher ID
 *           example: 507f1f77bcf86cd799439011
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 */

const classSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Class name is required'],
    trim: true,
    unique: true,
    maxlength: [100, 'Class name cannot exceed 100 characters'],
  },
  prof: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: [true, 'Teacher is required'],
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Class', classSchema);

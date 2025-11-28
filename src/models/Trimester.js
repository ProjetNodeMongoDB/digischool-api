const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Trimester:
 *       type: object
 *       required:
 *         - nom
 *         - date
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *           example: 507f1f77bcf86cd799439011
 *         nom:
 *           type: string
 *           maxLength: 10
 *           description: Trimester name
 *           example: T1
 *         date:
 *           type: string
 *           format: date
 *           description: Trimester date
 *           example: 2024-01-01
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 */

const trimesterSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Trimester name is required'],
    trim: true,
    maxlength: [10, 'Trimester name cannot exceed 10 characters'],
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Trimester', trimesterSchema);

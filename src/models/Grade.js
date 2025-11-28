const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Grade:
 *       type: object
 *       required:
 *         - ideleve
 *         - idclasse
 *         - idmatiere
 *         - idprof
 *         - idtrimestre
 *         - note
 *         - coefficient
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *           example: 507f1f77bcf86cd799439011
 *         ideleve:
 *           type: string
 *           description: Reference to Student ObjectId
 *           example: 507f1f77bcf86cd799439011
 *         idclasse:
 *           type: string
 *           description: Reference to Class ObjectId
 *           example: 507f1f77bcf86cd799439012
 *         idmatiere:
 *           type: string
 *           description: Reference to Subject ObjectId
 *           example: 507f1f77bcf86cd799439013
 *         idprof:
 *           type: string
 *           description: Reference to Teacher ObjectId
 *           example: 507f1f77bcf86cd799439014
 *         idtrimestre:
 *           type: string
 *           description: Reference to Trimester ObjectId
 *           example: 507f1f77bcf86cd799439015
 *         note:
 *           type: number
 *           format: float
 *           minimum: 0
 *           maximum: 20
 *           description: Grade score (0-20)
 *           example: 15.5
 *         coefficient:
 *           type: number
 *           format: float
 *           minimum: 0
 *           description: Grade coefficient (weight)
 *           example: 2
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 */

const gradeSchema = new mongoose.Schema({
  ideleve: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student reference is required']
  },
  idclasse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Class reference is required']
  },
  idmatiere: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: [true, 'Subject reference is required']
  },
  idprof: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: [true, 'Teacher reference is required']
  },
  idtrimestre: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trimester',
    required: [true, 'Trimester reference is required']
  },
  note: {
    type: Number,
    required: [true, 'Note is required'],
    min: [0, 'Note must be at least 0'],
    max: [20, 'Note cannot exceed 20']
  },
  coefficient: {
    type: Number,
    required: [true, 'Coefficient is required'],
    min: [0, 'Coefficient must be positive']
  }
}, {
  timestamps: true
});

// Index for faster queries on common filter combinations
gradeSchema.index({ ideleve: 1, idmatiere: 1, idtrimestre: 1 });

module.exports = mongoose.model('Grade', gradeSchema);

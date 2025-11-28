const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Student:
 *       type: object
 *       required:
 *         - nom
 *         - prenom
 *         - sexe
 *         - dateNaissance
 *         - classe
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *           example: 507f1f77bcf86cd799439011
 *         nom:
 *           type: string
 *           maxLength: 100
 *           description: Last name
 *           example: Martin
 *         prenom:
 *           type: string
 *           maxLength: 100
 *           description: First name
 *           example: Sophie
 *         sexe:
 *           type: string
 *           enum: [HOMME, FEMME]
 *           description: Gender
 *           example: FEMME
 *         dateNaissance:
 *           type: string
 *           format: date
 *           description: Birth date (must be in the past)
 *           example: 2010-03-20
 *         classe:
 *           type: string
 *           description: Reference to Class ID
 *           example: 507f1f77bcf86cd799439011
 *         adresse:
 *           type: string
 *           maxLength: 250
 *           description: Address (optional)
 *           example: 456 Avenue des Champs, 75008 Paris
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 */

const studentSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [100, 'Last name cannot exceed 100 characters'],
  },
  prenom: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [100, 'First name cannot exceed 100 characters'],
  },
  classe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Class is required'],
  },
  dateNaissance: {
    type: Date,
    required: [true, 'Birth date is required'],
    validate: {
      validator: function(value) {
        return value < new Date();
      },
      message: 'Birth date must be in the past',
    },
  },
  adresse: {
    type: String,
    trim: true,
    maxlength: [250, 'Address cannot exceed 250 characters'],
  },
  sexe: {
    type: String,
    required: [true, 'Gender is required'],
    enum: {
      values: ['HOMME', 'FEMME'],
      message: 'Gender must be either HOMME or FEMME',
    },
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Student', studentSchema);

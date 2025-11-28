const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Teacher:
 *       type: object
 *       required:
 *         - nom
 *         - prenom
 *         - sexe
 *         - dateNaissance
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *           example: 507f1f77bcf86cd799439011
 *         nom:
 *           type: string
 *           maxLength: 100
 *           description: Last name
 *           example: Dupont
 *         prenom:
 *           type: string
 *           maxLength: 100
 *           description: First name
 *           example: Jean
 *         sexe:
 *           type: string
 *           enum: [HOMME, FEMME]
 *           description: Gender
 *           example: HOMME
 *         dateNaissance:
 *           type: string
 *           format: date
 *           description: Birth date (must be in the past)
 *           example: 1980-05-15
 *         adresse:
 *           type: string
 *           maxLength: 250
 *           description: Address (optional)
 *           example: 123 Rue de Paris, 75001 Paris
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 */

const teacherSchema = new mongoose.Schema({
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

module.exports = mongoose.model('Teacher', teacherSchema);

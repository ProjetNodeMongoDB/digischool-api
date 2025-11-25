const mongoose = require('mongoose');

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

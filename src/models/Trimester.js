const mongoose = require('mongoose');

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

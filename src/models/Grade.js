const mongoose = require('mongoose');

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

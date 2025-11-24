// const mongoose = require('mongoose');
//
// const classSchema = new mongoose.Schema({
//   nom: {
//     type: String,
//     required: [true, 'Class name is required'],
//     trim: true,
//     unique: true,
//     maxlength: [100, 'Class name cannot exceed 100 characters'],
//   },
//   prof: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Teacher',
//     required: [true, 'Teacher is required'],
//   },
// }, {
//   timestamps: true,
// });
//
// module.exports = mongoose.model('Class', classSchema);

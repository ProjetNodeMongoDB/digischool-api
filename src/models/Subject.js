const mongoose = require('mongoose');

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

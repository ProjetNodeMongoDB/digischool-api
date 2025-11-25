const Subject = require('../models/Subject');

class SubjectService {
	// Get all subjects
	async getAllSubjects() {
		return await Subject.find().sort({ nom: 1 });
	}

	// Get subject by ID
	async getSubjectById(id) {
		const subject = await Subject.findById(id);
		if (!subject) {
			throw new Error('Subject not found');
		}
		return subject;
	}

	// Create new subject
	async createSubject(subjectData) {
		const subject = new Subject(subjectData);
		return await subject.save();
	}

	// Update subject
	async updateSubject(id, updateData) {
		const subject = await Subject.findByIdAndUpdate(id, updateData, {
			new: true,
			runValidators: true,
		});
		if (!subject) {
			throw new Error('Subject not found');
		}
		return subject;
	}

	// Delete subject
	async deleteSubject(id) {
		const subject = await Subject.findByIdAndDelete(id);
		if (!subject) {
			throw new Error('Subject not found');
		}
		return subject;
	}
}

module.exports = new SubjectService();

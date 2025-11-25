const subjectService = require('../services/subjectService');

class SubjectController {
	// @desc    Get all subjects
	// @route   GET /api/subjects
	// @access  Private
	async getAll(req, res, next) {
		try {
			const subjects = await subjectService.getAllSubjects();
			res.status(200).json({
				success: true,
				count: subjects.length,
				data: subjects,
			});
		} catch (error) {
			next(error);
		}
	}

	// @desc    Get single subject
	// @route   GET /api/subjects/:id
	// @access  Private
	async getById(req, res, next) {
		try {
			const subject = await subjectService.getSubjectById(req.params.id);
			res.status(200).json({
				success: true,
				data: subject,
			});
		} catch (error) {
			next(error);
		}
	}

	// @desc    Create new subject
	// @route   POST /api/subjects
	// @access  Private
	async create(req, res, next) {
		try {
			const subject = await subjectService.createSubject(req.body);
			res.status(201).json({
				success: true,
				data: subject,
			});
		} catch (error) {
			next(error);
		}
	}

	// @desc    Update subject
	// @route   PUT /api/subjects/:id
	// @access  Private
	async update(req, res, next) {
		try {
			const subject = await subjectService.updateSubject(
				req.params.id,
				req.body
			);
			res.status(200).json({
				success: true,
				data: subject,
			});
		} catch (error) {
			next(error);
		}
	}

	// @desc    Delete subject
	// @route   DELETE /api/subjects/:id
	// @access  Private
	async delete(req, res, next) {
		try {
			await subjectService.deleteSubject(req.params.id);
			res.status(200).json({
				success: true,
				message: 'Subject deleted successfully',
			});
		} catch (error) {
			next(error);
		}
	}
}

module.exports = new SubjectController();

/**
 * Unit Tests for GradeController
 * Tests HTTP request/response handling with mocked service layer
 * Includes complex filtering endpoints
 */

const gradeController = require('../../../src/controllers/gradeController');
const gradeService = require('../../../src/services/gradeService');
const { createMockExpressContext } = require('../helpers/testUtils');
const { grades, mockIds, edgeCases } = require('../mocks/fixtures');

// Mock the service layer
jest.mock('../../../src/services/gradeService');

describe('GradeController', () => {
  let req, res, next;

  beforeEach(() => {
    // Create fresh mocks for each test
    ({ req, res, next } = createMockExpressContext());
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return 200 with all grades when no filters provided', async () => {
      // Arrange
      const mockGrades = [grades.valid];
      gradeService.getAllGrades.mockResolvedValue(mockGrades);

      // Act
      await gradeController.getAll(req, res, next);

      // Assert
      expect(gradeService.getAllGrades).toHaveBeenCalledWith({
        student: undefined,
        class: undefined,
        subject: undefined,
        trimester: undefined
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: mockGrades.length,
        data: mockGrades
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 200 with empty array when no grades', async () => {
      // Arrange
      gradeService.getAllGrades.mockResolvedValue([]);

      // Act
      await gradeController.getAll(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 0,
        data: []
      });
    });

    it('should filter grades by student when query parameter provided', async () => {
      // Arrange
      req.query.student = mockIds.student1;
      const mockGrades = [grades.valid];
      gradeService.getAllGrades.mockResolvedValue(mockGrades);

      // Act
      await gradeController.getAll(req, res, next);

      // Assert
      expect(gradeService.getAllGrades).toHaveBeenCalledWith({
        student: mockIds.student1,
        class: undefined,
        subject: undefined,
        trimester: undefined
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should filter grades by class when query parameter provided', async () => {
      // Arrange
      req.query.class = mockIds.class1;
      const mockGrades = [grades.valid];
      gradeService.getAllGrades.mockResolvedValue(mockGrades);

      // Act
      await gradeController.getAll(req, res, next);

      // Assert
      expect(gradeService.getAllGrades).toHaveBeenCalledWith({
        student: undefined,
        class: mockIds.class1,
        subject: undefined,
        trimester: undefined
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should filter grades by subject when query parameter provided', async () => {
      // Arrange
      req.query.subject = mockIds.subject1;
      const mockGrades = [grades.valid];
      gradeService.getAllGrades.mockResolvedValue(mockGrades);

      // Act
      await gradeController.getAll(req, res, next);

      // Assert
      expect(gradeService.getAllGrades).toHaveBeenCalledWith({
        student: undefined,
        class: undefined,
        subject: mockIds.subject1,
        trimester: undefined
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should filter grades by trimester when query parameter provided', async () => {
      // Arrange
      req.query.trimester = mockIds.trimester1;
      const mockGrades = [grades.valid];
      gradeService.getAllGrades.mockResolvedValue(mockGrades);

      // Act
      await gradeController.getAll(req, res, next);

      // Assert
      expect(gradeService.getAllGrades).toHaveBeenCalledWith({
        student: undefined,
        class: undefined,
        subject: undefined,
        trimester: mockIds.trimester1
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should filter grades by multiple parameters', async () => {
      // Arrange
      req.query.student = mockIds.student1;
      req.query.class = mockIds.class1;
      req.query.trimester = mockIds.trimester1;
      const mockGrades = [grades.valid];
      gradeService.getAllGrades.mockResolvedValue(mockGrades);

      // Act
      await gradeController.getAll(req, res, next);

      // Assert
      expect(gradeService.getAllGrades).toHaveBeenCalledWith({
        student: mockIds.student1,
        class: mockIds.class1,
        subject: undefined,
        trimester: mockIds.trimester1
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should filter grades by all parameters simultaneously', async () => {
      // Arrange
      req.query.student = mockIds.student1;
      req.query.class = mockIds.class1;
      req.query.subject = mockIds.subject1;
      req.query.trimester = mockIds.trimester1;
      const mockGrades = [grades.valid];
      gradeService.getAllGrades.mockResolvedValue(mockGrades);

      // Act
      await gradeController.getAll(req, res, next);

      // Assert
      expect(gradeService.getAllGrades).toHaveBeenCalledWith({
        student: mockIds.student1,
        class: mockIds.class1,
        subject: mockIds.subject1,
        trimester: mockIds.trimester1
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle invalid ObjectId in query parameters', async () => {
      // Arrange
      req.query.student = 'invalid-id';
      req.query.class = 'another-invalid-id';
      const error = new Error('Invalid ObjectId format');
      gradeService.getAllGrades.mockRejectedValue(error);

      // Act
      await gradeController.getAll(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle empty string filter parameters', async () => {
      // Arrange
      req.query.student = '';
      req.query.class = '';
      req.query.subject = '';
      req.query.trimester = '';
      const mockGrades = [grades.valid];
      gradeService.getAllGrades.mockResolvedValue(mockGrades);

      // Act
      await gradeController.getAll(req, res, next);

      // Assert
      expect(gradeService.getAllGrades).toHaveBeenCalledWith({
        student: '',
        class: '',
        subject: '',
        trimester: ''
      });
    });

    it('should handle non-existent filter combinations', async () => {
      // Arrange
      req.query.student = mockIds.student1;
      req.query.subject = mockIds.subject1;
      gradeService.getAllGrades.mockResolvedValue([]); // No grades match

      // Act
      await gradeController.getAll(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 0,
        data: []
      });
    });

    it('should handle SQL injection attempts in query parameters', async () => {
      // Arrange
      req.query.student = "'; DROP TABLE grades; --";
      req.query.class = "1 OR 1=1";
      const error = new Error('Invalid filter format');
      gradeService.getAllGrades.mockRejectedValue(error);

      // Act
      await gradeController.getAll(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle extremely long query parameter values', async () => {
      // Arrange
      req.query.student = 'a'.repeat(1000); // Extremely long value
      const error = new Error('Query parameter too long');
      gradeService.getAllGrades.mockRejectedValue(error);

      // Act
      await gradeController.getAll(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should ignore unexpected query parameters', async () => {
      // Arrange
      req.query.student = mockIds.student1;
      req.query.unexpectedParam = 'should-be-ignored';
      req.query.anotherBadParam = 'also-ignored';
      const mockGrades = [grades.valid];
      gradeService.getAllGrades.mockResolvedValue(mockGrades);

      // Act
      await gradeController.getAll(req, res, next);

      // Assert - Only valid parameters should be passed
      expect(gradeService.getAllGrades).toHaveBeenCalledWith({
        student: mockIds.student1,
        class: undefined,
        subject: undefined,
        trimester: undefined
      });
    });

    it('should call next with error on service failure', async () => {
      // Arrange
      const error = new Error('Database error');
      gradeService.getAllGrades.mockRejectedValue(error);

      // Act
      await gradeController.getAll(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should return 200 with grade data', async () => {
      // Arrange
      req.params.id = mockIds.grade1;
      gradeService.getGradeById.mockResolvedValue(grades.valid);

      // Act
      await gradeController.getById(req, res, next);

      // Assert
      expect(gradeService.getGradeById).toHaveBeenCalledWith(mockIds.grade1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: grades.valid
      });
    });

    it('should call next with error when grade not found', async () => {
      // Arrange
      req.params.id = edgeCases.nonExistentId;
      const error = new Error('Grade not found');
      gradeService.getGradeById.mockRejectedValue(error);

      // Act
      await gradeController.getById(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle missing id parameter', async () => {
      // Arrange
      req.params.id = undefined;
      const error = new Error('Cast to ObjectId failed');
      gradeService.getGradeById.mockRejectedValue(error);

      // Act
      await gradeController.getById(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('create', () => {
    it('should return 201 with created grade', async () => {
      // Arrange
      req.body = grades.validInput;
      const createdGrade = { ...grades.validInput, _id: mockIds.grade1 };
      gradeService.createGrade.mockResolvedValue(createdGrade);

      // Act
      await gradeController.create(req, res, next);

      // Assert
      expect(gradeService.createGrade).toHaveBeenCalledWith(grades.validInput);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: createdGrade
      });
    });

    it('should call next with validation error', async () => {
      // Arrange
      req.body = grades.invalid;
      const error = new Error('Validation failed');
      gradeService.createGrade.mockRejectedValue(error);

      // Act
      await gradeController.create(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle empty request body', async () => {
      // Arrange
      req.body = {};
      const error = new Error('Missing required fields');
      gradeService.createGrade.mockRejectedValue(error);

      // Act
      await gradeController.create(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('update', () => {
    it('should return 200 with updated grade', async () => {
      // Arrange
      req.params.id = mockIds.grade1;
      req.body = { note: 18, avis: 'Excellent travail' };
      const updated = { ...grades.valid, note: 18, avis: 'Excellent travail' };
      gradeService.updateGrade.mockResolvedValue(updated);

      // Act
      await gradeController.update(req, res, next);

      // Assert
      expect(gradeService.updateGrade).toHaveBeenCalledWith(mockIds.grade1, req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: updated
      });
    });

    it('should call next when grade not found', async () => {
      // Arrange
      req.params.id = edgeCases.nonExistentId;
      req.body = { note: 15 };
      const error = new Error('Grade not found');
      gradeService.updateGrade.mockRejectedValue(error);

      // Act
      await gradeController.update(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('delete', () => {
    it('should return 200 with success message', async () => {
      // Arrange
      req.params.id = mockIds.grade1;
      gradeService.deleteGrade.mockResolvedValue(grades.valid);

      // Act
      await gradeController.delete(req, res, next);

      // Assert
      expect(gradeService.deleteGrade).toHaveBeenCalledWith(mockIds.grade1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Grade deleted successfully'
      });
    });

    it('should call next when grade not found', async () => {
      // Arrange
      req.params.id = edgeCases.nonExistentId;
      const error = new Error('Grade not found');
      gradeService.deleteGrade.mockRejectedValue(error);

      // Act
      await gradeController.delete(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});

/**
 * Unit Tests for SubjectController
 * Tests HTTP request/response handling with mocked service layer
 */

const subjectController = require('../../../src/controllers/subjectController');
const subjectService = require('../../../src/services/subjectService');
const { createMockExpressContext } = require('../helpers/testUtils');
const { subjects, mockIds, edgeCases } = require('../mocks/fixtures');

// Mock the service layer
jest.mock('../../../src/services/subjectService');

describe('SubjectController', () => {
  let req, res, next;

  beforeEach(() => {
    // Create fresh mocks for each test
    ({ req, res, next } = createMockExpressContext());
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return 200 with all subjects', async () => {
      // Arrange
      const mockSubjects = [subjects.valid];
      subjectService.getAllSubjects.mockResolvedValue(mockSubjects);

      // Act
      await subjectController.getAll(req, res, next);

      // Assert
      expect(subjectService.getAllSubjects).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: mockSubjects.length,
        data: mockSubjects
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 200 with empty array when no subjects', async () => {
      // Arrange
      subjectService.getAllSubjects.mockResolvedValue([]);

      // Act
      await subjectController.getAll(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 0,
        data: []
      });
    });

    it('should call next with error on service failure', async () => {
      // Arrange
      const error = new Error('Database error');
      subjectService.getAllSubjects.mockRejectedValue(error);

      // Act
      await subjectController.getAll(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should return 200 with subject data', async () => {
      // Arrange
      req.params.id = mockIds.subject1;
      subjectService.getSubjectById.mockResolvedValue(subjects.valid);

      // Act
      await subjectController.getById(req, res, next);

      // Assert
      expect(subjectService.getSubjectById).toHaveBeenCalledWith(mockIds.subject1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: subjects.valid
      });
    });

    it('should call next with error when subject not found', async () => {
      // Arrange
      req.params.id = edgeCases.nonExistentId;
      const error = new Error('Subject not found');
      subjectService.getSubjectById.mockRejectedValue(error);

      // Act
      await subjectController.getById(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle missing id parameter', async () => {
      // Arrange
      req.params.id = undefined;
      const error = new Error('Cast to ObjectId failed');
      subjectService.getSubjectById.mockRejectedValue(error);

      // Act
      await subjectController.getById(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('create', () => {
    it('should return 201 with created subject', async () => {
      // Arrange
      req.body = { nom: 'HISTOIRE' };
      const createdSubject = { ...req.body, _id: mockIds.subject2 };
      subjectService.createSubject.mockResolvedValue(createdSubject);

      // Act
      await subjectController.create(req, res, next);

      // Assert
      expect(subjectService.createSubject).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: createdSubject
      });
    });

    it('should call next with validation error', async () => {
      // Arrange
      req.body = { nom: '' };  // Invalid input
      const error = new Error('Validation failed');
      subjectService.createSubject.mockRejectedValue(error);

      // Act
      await subjectController.create(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle empty request body', async () => {
      // Arrange
      req.body = {};
      const error = new Error('Missing required fields');
      subjectService.createSubject.mockRejectedValue(error);

      // Act
      await subjectController.create(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('update', () => {
    it('should return 200 with updated subject', async () => {
      // Arrange
      req.params.id = mockIds.subject1;
      req.body = { nom: 'GEOGRAPHIE' };
      const updated = { ...subjects.valid, nom: 'GEOGRAPHIE' };
      subjectService.updateSubject.mockResolvedValue(updated);

      // Act
      await subjectController.update(req, res, next);

      // Assert
      expect(subjectService.updateSubject).toHaveBeenCalledWith(mockIds.subject1, req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: updated
      });
    });

    it('should call next when subject not found', async () => {
      // Arrange
      req.params.id = edgeCases.nonExistentId;
      req.body = { nom: 'Test' };
      const error = new Error('Subject not found');
      subjectService.updateSubject.mockRejectedValue(error);

      // Act
      await subjectController.update(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('delete', () => {
    it('should return 200 with success message', async () => {
      // Arrange
      req.params.id = mockIds.subject1;
      subjectService.deleteSubject.mockResolvedValue(subjects.valid);

      // Act
      await subjectController.delete(req, res, next);

      // Assert
      expect(subjectService.deleteSubject).toHaveBeenCalledWith(mockIds.subject1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Subject deleted successfully'
      });
    });

    it('should call next when subject not found', async () => {
      // Arrange
      req.params.id = edgeCases.nonExistentId;
      const error = new Error('Subject not found');
      subjectService.deleteSubject.mockRejectedValue(error);

      // Act
      await subjectController.delete(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});

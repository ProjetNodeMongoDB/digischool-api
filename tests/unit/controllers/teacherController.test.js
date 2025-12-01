/**
 * Unit Tests for TeacherController
 * Tests HTTP request/response handling with mocked service layer
 */

const teacherController = require('../../../src/controllers/teacherController');
const teacherService = require('../../../src/services/teacherService');
const { createMockExpressContext } = require('../helpers/testUtils');
const { teachers, mockIds, edgeCases } = require('../mocks/fixtures');

// Mock the service layer
jest.mock('../../../src/services/teacherService');

describe('TeacherController', () => {
  let req, res, next;

  beforeEach(() => {
    // Create fresh mocks for each test
    ({ req, res, next } = createMockExpressContext());
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return 200 with all teachers', async () => {
      // Arrange
      const mockTeachers = [teachers.valid];
      teacherService.getAllTeachers.mockResolvedValue(mockTeachers);

      // Act
      await teacherController.getAll(req, res, next);

      // Assert
      expect(teacherService.getAllTeachers).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: mockTeachers.length,
        data: mockTeachers
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 200 with empty array when no teachers', async () => {
      // Arrange
      teacherService.getAllTeachers.mockResolvedValue([]);

      // Act
      await teacherController.getAll(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 0,
        data: []
      });
    });

    it('should filter teachers by class when query parameter provided', async () => {
      // Arrange
      req.query.classe = mockIds.class1;
      const mockTeachers = [teachers.valid];
      teacherService.getTeachersByClass.mockResolvedValue(mockTeachers);

      // Act
      await teacherController.getAll(req, res, next);

      // Assert
      expect(teacherService.getTeachersByClass).toHaveBeenCalledWith(mockIds.class1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: mockTeachers.length,
        data: mockTeachers
      });
    });

    it('should call next with error on service failure', async () => {
      // Arrange
      const error = new Error('Database error');
      teacherService.getAllTeachers.mockRejectedValue(error);

      // Act
      await teacherController.getAll(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should return 200 with teacher data', async () => {
      // Arrange
      req.params.id = mockIds.teacher1;
      teacherService.getTeacherById.mockResolvedValue(teachers.valid);

      // Act
      await teacherController.getById(req, res, next);

      // Assert
      expect(teacherService.getTeacherById).toHaveBeenCalledWith(mockIds.teacher1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: teachers.valid
      });
    });

    it('should call next with error when teacher not found', async () => {
      // Arrange
      req.params.id = edgeCases.nonExistentId;
      const error = new Error('Teacher not found');
      teacherService.getTeacherById.mockRejectedValue(error);

      // Act
      await teacherController.getById(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle missing id parameter', async () => {
      // Arrange
      req.params.id = undefined;
      const error = new Error('Cast to ObjectId failed');
      teacherService.getTeacherById.mockRejectedValue(error);

      // Act
      await teacherController.getById(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('create', () => {
    it('should return 201 with created teacher', async () => {
      // Arrange
      req.body = teachers.validInput;
      const createdTeacher = { ...teachers.validInput, _id: mockIds.teacher2 };
      teacherService.createTeacher.mockResolvedValue(createdTeacher);

      // Act
      await teacherController.create(req, res, next);

      // Assert
      expect(teacherService.createTeacher).toHaveBeenCalledWith(teachers.validInput);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: createdTeacher
      });
    });

    it('should call next with validation error', async () => {
      // Arrange
      req.body = teachers.invalid;
      const error = new Error('Validation failed');
      teacherService.createTeacher.mockRejectedValue(error);

      // Act
      await teacherController.create(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle empty request body', async () => {
      // Arrange
      req.body = {};
      const error = new Error('Missing required fields');
      teacherService.createTeacher.mockRejectedValue(error);

      // Act
      await teacherController.create(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('update', () => {
    it('should return 200 with updated teacher', async () => {
      // Arrange
      req.params.id = mockIds.teacher1;
      req.body = { nom: 'Updated Name' };
      const updated = { ...teachers.valid, nom: 'Updated Name' };
      teacherService.updateTeacher.mockResolvedValue(updated);

      // Act
      await teacherController.update(req, res, next);

      // Assert
      expect(teacherService.updateTeacher).toHaveBeenCalledWith(mockIds.teacher1, req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: updated
      });
    });

    it('should call next when teacher not found', async () => {
      // Arrange
      req.params.id = edgeCases.nonExistentId;
      req.body = { nom: 'Test' };
      const error = new Error('Teacher not found');
      teacherService.updateTeacher.mockRejectedValue(error);

      // Act
      await teacherController.update(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('delete', () => {
    it('should return 200 with success message', async () => {
      // Arrange
      req.params.id = mockIds.teacher1;
      teacherService.deleteTeacher.mockResolvedValue(teachers.valid);

      // Act
      await teacherController.delete(req, res, next);

      // Assert
      expect(teacherService.deleteTeacher).toHaveBeenCalledWith(mockIds.teacher1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Teacher deleted successfully'
      });
    });

    it('should call next when teacher not found', async () => {
      // Arrange
      req.params.id = edgeCases.nonExistentId;
      const error = new Error('Teacher not found');
      teacherService.deleteTeacher.mockRejectedValue(error);

      // Act
      await teacherController.delete(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});

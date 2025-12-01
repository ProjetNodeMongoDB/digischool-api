/**
 * Unit Tests for StudentController
 * Tests HTTP request/response handling with mocked service layer
 */

const studentController = require('../../../src/controllers/studentController');
const studentService = require('../../../src/services/studentService');
const { createMockExpressContext } = require('../helpers/testUtils');
const { students, mockIds, edgeCases } = require('../mocks/fixtures');

// Mock the service layer
jest.mock('../../../src/services/studentService');

describe('StudentController', () => {
  let req, res, next;

  beforeEach(() => {
    // Create fresh mocks for each test
    ({ req, res, next } = createMockExpressContext());
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return 200 with all students', async () => {
      // Arrange
      const mockStudents = [students.valid];
      studentService.getAllStudents.mockResolvedValue(mockStudents);

      // Act
      await studentController.getAll(req, res, next);

      // Assert
      expect(studentService.getAllStudents).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: mockStudents.length,
        data: mockStudents
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 200 with empty array when no students', async () => {
      // Arrange
      studentService.getAllStudents.mockResolvedValue([]);

      // Act
      await studentController.getAll(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 0,
        data: []
      });
    });

    it('should filter students by class when query parameter provided', async () => {
      // Arrange
      req.query.classe = mockIds.class1;
      const mockStudents = [students.valid];
      studentService.getStudentsByClass.mockResolvedValue(mockStudents);

      // Act
      await studentController.getAll(req, res, next);

      // Assert
      expect(studentService.getStudentsByClass).toHaveBeenCalledWith(mockIds.class1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: mockStudents.length,
        data: mockStudents
      });
    });

    it('should call next with error on service failure', async () => {
      // Arrange
      const error = new Error('Database error');
      studentService.getAllStudents.mockRejectedValue(error);

      // Act
      await studentController.getAll(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should return 200 with student data', async () => {
      // Arrange
      req.params.id = mockIds.student1;
      studentService.getStudentById.mockResolvedValue(students.valid);

      // Act
      await studentController.getById(req, res, next);

      // Assert
      expect(studentService.getStudentById).toHaveBeenCalledWith(mockIds.student1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: students.valid
      });
    });

    it('should call next with error when student not found', async () => {
      // Arrange
      req.params.id = edgeCases.nonExistentId;
      const error = new Error('Student not found');
      studentService.getStudentById.mockRejectedValue(error);

      // Act
      await studentController.getById(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle missing id parameter', async () => {
      // Arrange
      req.params.id = undefined;
      const error = new Error('Cast to ObjectId failed');
      studentService.getStudentById.mockRejectedValue(error);

      // Act
      await studentController.getById(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('create', () => {
    it('should return 201 with created student', async () => {
      // Arrange
      req.body = students.validInput;
      const createdStudent = { ...students.validInput, _id: mockIds.student2 };
      studentService.createStudent.mockResolvedValue(createdStudent);

      // Act
      await studentController.create(req, res, next);

      // Assert
      expect(studentService.createStudent).toHaveBeenCalledWith(students.validInput);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: createdStudent
      });
    });

    it('should call next with validation error', async () => {
      // Arrange
      req.body = { nom: '' };  // Invalid input
      const error = new Error('Validation failed');
      studentService.createStudent.mockRejectedValue(error);

      // Act
      await studentController.create(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle empty request body', async () => {
      // Arrange
      req.body = {};
      const error = new Error('Missing required fields');
      studentService.createStudent.mockRejectedValue(error);

      // Act
      await studentController.create(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('update', () => {
    it('should return 200 with updated student', async () => {
      // Arrange
      req.params.id = mockIds.student1;
      req.body = { nom: 'Updated Name' };
      const updated = { ...students.valid, nom: 'Updated Name' };
      studentService.updateStudent.mockResolvedValue(updated);

      // Act
      await studentController.update(req, res, next);

      // Assert
      expect(studentService.updateStudent).toHaveBeenCalledWith(mockIds.student1, req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: updated
      });
    });

    it('should call next when student not found', async () => {
      // Arrange
      req.params.id = edgeCases.nonExistentId;
      req.body = { nom: 'Test' };
      const error = new Error('Student not found');
      studentService.updateStudent.mockRejectedValue(error);

      // Act
      await studentController.update(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('delete', () => {
    it('should return 200 with success message', async () => {
      // Arrange
      req.params.id = mockIds.student1;
      studentService.deleteStudent.mockResolvedValue(students.valid);

      // Act
      await studentController.delete(req, res, next);

      // Assert
      expect(studentService.deleteStudent).toHaveBeenCalledWith(mockIds.student1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Student deleted successfully'
      });
    });

    it('should call next when student not found', async () => {
      // Arrange
      req.params.id = edgeCases.nonExistentId;
      const error = new Error('Student not found');
      studentService.deleteStudent.mockRejectedValue(error);

      // Act
      await studentController.delete(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});

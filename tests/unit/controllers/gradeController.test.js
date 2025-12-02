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

  describe('getStudentsByTeacher', () => {
    it('should return 200 with students and their grades data', async () => {
      // Arrange
      req.params.teacherId = mockIds.teacher1;
      const mockStudentsWithGrades = [
        {
          _id: mockIds.student1,
          nom: 'Leroy',
          prenom: 'Thomas',
          classe: { _id: mockIds.class1, nom: 'CM1' },
          grades: [
            {
              _id: mockIds.grade1,
              idmatiere: { _id: mockIds.subject1, nom: 'MATHEMATIQUES' },
              idtrimestre: { _id: mockIds.trimester1, nom: 'TRIM01' },
              note: 15.5,
              coefficient: 2
            }
          ]
        }
      ];
      gradeService.getStudentsWithGradesByTeacher.mockResolvedValue(mockStudentsWithGrades);

      // Act
      await gradeController.getStudentsByTeacher(req, res, next);

      // Assert
      expect(gradeService.getStudentsWithGradesByTeacher).toHaveBeenCalledWith(mockIds.teacher1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: mockStudentsWithGrades.length,
        data: mockStudentsWithGrades
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 200 with empty array when teacher has no students', async () => {
      // Arrange
      req.params.teacherId = mockIds.teacher2;
      gradeService.getStudentsWithGradesByTeacher.mockResolvedValue([]);

      // Act
      await gradeController.getStudentsByTeacher(req, res, next);

      // Assert
      expect(gradeService.getStudentsWithGradesByTeacher).toHaveBeenCalledWith(mockIds.teacher2);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 0,
        data: []
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 200 with multiple students and their grades', async () => {
      // Arrange
      req.params.teacherId = mockIds.teacher1;
      const mockStudentsWithGrades = [
        {
          _id: mockIds.student1,
          nom: 'Leroy',
          prenom: 'Thomas',
          classe: { _id: mockIds.class1, nom: 'CM1' },
          grades: [
            { note: 15.5, coefficient: 2, idmatiere: { nom: 'MATHEMATIQUES' } },
            { note: 17, coefficient: 1, idmatiere: { nom: 'FRANCAIS' } }
          ]
        },
        {
          _id: mockIds.student2,
          nom: 'Bernard',
          prenom: 'Marie',
          classe: { _id: mockIds.class1, nom: 'CM1' },
          grades: [
            { note: 16, coefficient: 2, idmatiere: { nom: 'MATHEMATIQUES' } }
          ]
        }
      ];
      gradeService.getStudentsWithGradesByTeacher.mockResolvedValue(mockStudentsWithGrades);

      // Act
      await gradeController.getStudentsByTeacher(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: mockStudentsWithGrades
      });
    });

    it('should call next with error when teacher not found', async () => {
      // Arrange
      req.params.teacherId = edgeCases.nonExistentId;
      const error = new Error('Teacher not found');
      gradeService.getStudentsWithGradesByTeacher.mockRejectedValue(error);

      // Act
      await gradeController.getStudentsByTeacher(req, res, next);

      // Assert
      expect(gradeService.getStudentsWithGradesByTeacher).toHaveBeenCalledWith(edgeCases.nonExistentId);
      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should call next with error for invalid teacherId format', async () => {
      // Arrange
      req.params.teacherId = edgeCases.invalidObjectId;
      const error = new Error('Invalid teacher ID format');
      gradeService.getStudentsWithGradesByTeacher.mockRejectedValue(error);

      // Act
      await gradeController.getStudentsByTeacher(req, res, next);

      // Assert
      expect(gradeService.getStudentsWithGradesByTeacher).toHaveBeenCalledWith(edgeCases.invalidObjectId);
      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should handle missing teacherId parameter', async () => {
      // Arrange
      req.params.teacherId = undefined;
      const error = new Error('Teacher ID is required');
      gradeService.getStudentsWithGradesByTeacher.mockRejectedValue(error);

      // Act
      await gradeController.getStudentsByTeacher(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle SQL injection attempts in teacherId', async () => {
      // Arrange
      req.params.teacherId = "'; DROP TABLE students; --";
      const error = new Error('Invalid teacher ID format');
      gradeService.getStudentsWithGradesByTeacher.mockRejectedValue(error);

      // Act
      await gradeController.getStudentsByTeacher(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle XSS attempts in teacherId', async () => {
      // Arrange
      req.params.teacherId = '<script>alert("XSS")</script>';
      const error = new Error('Invalid teacher ID format');
      gradeService.getStudentsWithGradesByTeacher.mockRejectedValue(error);

      // Act
      await gradeController.getStudentsByTeacher(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should call next with error on service failure', async () => {
      // Arrange
      req.params.teacherId = mockIds.teacher1;
      const error = new Error('Database connection failed');
      gradeService.getStudentsWithGradesByTeacher.mockRejectedValue(error);

      // Act
      await gradeController.getStudentsByTeacher(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should handle extremely long teacherId values', async () => {
      // Arrange
      req.params.teacherId = 'a'.repeat(1000);
      const error = new Error('Invalid teacher ID format');
      gradeService.getStudentsWithGradesByTeacher.mockRejectedValue(error);

      // Act
      await gradeController.getStudentsByTeacher(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should return correct count for single student with multiple grades', async () => {
      // Arrange
      req.params.teacherId = mockIds.teacher1;
      const mockStudentsWithGrades = [
        {
          _id: mockIds.student1,
          nom: 'Leroy',
          prenom: 'Thomas',
          grades: [
            { note: 15, idmatiere: { nom: 'MATHEMATIQUES' } },
            { note: 16, idmatiere: { nom: 'FRANCAIS' } },
            { note: 14, idmatiere: { nom: 'HISTOIRE' } }
          ]
        }
      ];
      gradeService.getStudentsWithGradesByTeacher.mockResolvedValue(mockStudentsWithGrades);

      // Act
      await gradeController.getStudentsByTeacher(req, res, next);

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 1, // Count of students, not grades
        data: mockStudentsWithGrades
      });
    });
  });
});

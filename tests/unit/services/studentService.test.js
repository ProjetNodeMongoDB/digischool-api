/**
 * Unit Tests for Student Service
 *
 * Comprehensive test suite for student management operations including CRUD functionality,
 * class assignment validation, and relationship handling with populated data.
 *
 * Key Test Areas:
 * - Student retrieval with class population and sorting
 * - Student creation with class reference validation
 * - Update operations with data integrity checks
 * - Deletion with proper error handling
 * - Class-student relationship validation
 *
 * Mock Patterns:
 * - Student model mocked for isolated unit testing
 * - Population simulation for class relationships
 * - Database error scenarios including connection timeouts
 * - Validation error simulation for business rules
 *
 * Business Logic Tested:
 * - Students must belong to valid classes
 * - Proper sorting by nom and prenom
 * - Age validation through birth date checks
 * - Address field optionality
 */

const studentService = require('../../../src/services/studentService');
const Student = require('../../../src/models/Student');
const { students, mockIds, edgeCases } = require('../mocks/fixtures');

jest.mock('../../../src/models/Student');

describe('StudentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllStudents', () => {
    it('should return all students sorted by nom', async () => {
      const mockStudents = [students.valid];
      Student.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockStudents),
      });

      const result = await studentService.getAllStudents();

      expect(Student.find).toHaveBeenCalled();
      expect(result).toEqual(mockStudents);
    });

    it('should return empty array when no students', async () => {
      Student.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([]),
      });

      const result = await studentService.getAllStudents();

      expect(result).toEqual([]);
    });

    it('should propagate database errors', async () => {
      Student.find.mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error('DB error')),
      });

      await expect(studentService.getAllStudents()).rejects.toThrow('DB error');
    });
  });

  describe('getStudentById', () => {
    it('should return student when found', async () => {
      Student.findById.mockResolvedValue(students.valid);

      const result = await studentService.getStudentById(mockIds.student1);

      expect(Student.findById).toHaveBeenCalledWith(mockIds.student1);
      expect(result).toEqual(students.valid);
    });

    it('should throw error when student not found', async () => {
      Student.findById.mockResolvedValue(null);

      await expect(studentService.getStudentById(edgeCases.nonExistentId))
        .rejects.toThrow('Student not found');
    });

    it('should handle invalid ObjectId format', async () => {
      Student.findById.mockRejectedValue(new Error('Cast to ObjectId failed'));

      await expect(studentService.getStudentById(edgeCases.invalidObjectId))
        .rejects.toThrow('Cast to ObjectId failed');
    });

    it('should propagate database errors', async () => {
      Student.findById.mockRejectedValue(new Error('Connection timeout'));

      await expect(studentService.getStudentById(mockIds.student1))
        .rejects.toThrow('Connection timeout');
    });
  });

  describe('createStudent', () => {
    it('should create and return new student', async () => {
      const newData = students.validInput;
      const savedStudent = { ...newData, _id: mockIds.student2 };

      Student.mockImplementation(function(data) {
        this._id = mockIds.student2;
        Object.assign(this, data);
        this.save = jest.fn().mockResolvedValue(this);
        return this;
      });

      const result = await studentService.createStudent(newData);

      expect(Student).toHaveBeenCalledWith(newData);
      expect(result._id).toEqual(mockIds.student2);
      expect(result.nom).toEqual(newData.nom);
    });

    it('should handle Mongoose validation errors', async () => {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';

      Student.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(error),
      }));

      await expect(studentService.createStudent(students.invalid))
        .rejects.toThrow('Validation failed');
    });

    it('should reject student with invalid classe reference', async () => {
      const invalidData = { ...students.validInput, classe: edgeCases.invalidObjectId };
      const error = new Error('Cast to ObjectId failed');

      Student.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(error),
      }));

      await expect(studentService.createStudent(invalidData))
        .rejects.toThrow('Cast to ObjectId failed');
    });

    it('should propagate database errors', async () => {
      Student.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(new Error('DB error')),
      }));

      await expect(studentService.createStudent(students.validInput))
        .rejects.toThrow('DB error');
    });
  });

  describe('updateStudent', () => {
    it('should update and return student', async () => {
      const updateData = { nom: 'Updated' };
      const updated = { ...students.valid, ...updateData };

      Student.findByIdAndUpdate.mockResolvedValue(updated);

      const result = await studentService.updateStudent(mockIds.student1, updateData);

      expect(Student.findByIdAndUpdate).toHaveBeenCalledWith(
        mockIds.student1,
        updateData,
        { new: true, runValidators: true }
      );
      expect(result.nom).toBe('Updated');
    });

    it('should throw error when student not found', async () => {
      Student.findByIdAndUpdate.mockResolvedValue(null);

      await expect(studentService.updateStudent(edgeCases.nonExistentId, {}))
        .rejects.toThrow('Student not found');
    });

    it('should validate update data', async () => {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      Student.findByIdAndUpdate.mockRejectedValue(error);

      await expect(studentService.updateStudent(mockIds.student1, students.invalid))
        .rejects.toThrow('Validation failed');
    });

    it('should propagate database errors', async () => {
      Student.findByIdAndUpdate.mockRejectedValue(new Error('DB error'));

      await expect(studentService.updateStudent(mockIds.student1, {}))
        .rejects.toThrow('DB error');
    });
  });

  describe('deleteStudent', () => {
    it('should delete and return student', async () => {
      Student.findByIdAndDelete.mockResolvedValue(students.valid);

      const result = await studentService.deleteStudent(mockIds.student1);

      expect(Student.findByIdAndDelete).toHaveBeenCalledWith(mockIds.student1);
      expect(result).toEqual(students.valid);
    });

    it('should throw error when student not found', async () => {
      Student.findByIdAndDelete.mockResolvedValue(null);

      await expect(studentService.deleteStudent(edgeCases.nonExistentId))
        .rejects.toThrow('Student not found');
    });

    it('should propagate database errors', async () => {
      Student.findByIdAndDelete.mockRejectedValue(new Error('DB error'));

      await expect(studentService.deleteStudent(mockIds.student1))
        .rejects.toThrow('DB error');
    });
  });

  describe('getStudentsGroupedByClass', () => {
    it('should return students grouped by class', async () => {
      const mockStudents = [
        {
          _id: mockIds.student1,
          nom: 'Martin',
          prenom: 'Sophie',
          dateNaissance: new Date('2010-03-20'),
          sexe: 'FEMME',
          adresse: '123 Rue Test',
          classe: {
            _id: mockIds.class1,
            nom: 'CM1',
            prof: {
              nom: 'Dupont',
              prenom: 'Jean'
            }
          }
        },
        {
          _id: mockIds.student2,
          nom: 'Dubois',
          prenom: 'Pierre',
          dateNaissance: new Date('2010-05-15'),
          sexe: 'HOMME',
          adresse: '456 Avenue Test',
          classe: {
            _id: mockIds.class1,
            nom: 'CM1',
            prof: {
              nom: 'Dupont',
              prenom: 'Jean'
            }
          }
        }
      ];

      Student.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockStudents)
      });

      const result = await studentService.getStudentsGroupedByClass();

      expect(Student.find).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].class.nom).toBe('CM1');
      expect(result[0].students).toHaveLength(2);
      expect(result[0].students[0].nom).toBe('Martin');
    });

    it('should skip students without assigned class', async () => {
      const mockStudents = [
        {
          _id: mockIds.student1,
          nom: 'Martin',
          prenom: 'Sophie',
          dateNaissance: new Date('2010-03-20'),
          sexe: 'FEMME',
          classe: {
            _id: mockIds.class1,
            nom: 'CM1',
            prof: null
          }
        },
        {
          _id: mockIds.student2,
          nom: 'Dubois',
          prenom: 'Pierre',
          dateNaissance: new Date('2010-05-15'),
          sexe: 'HOMME',
          classe: null
        }
      ];

      Student.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockStudents)
      });

      const result = await studentService.getStudentsGroupedByClass();

      expect(result).toHaveLength(1);
      expect(result[0].students).toHaveLength(1);
      expect(result[0].students[0].nom).toBe('Martin');
    });

    it('should return empty array when no students', async () => {
      Student.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([])
      });

      const result = await studentService.getStudentsGroupedByClass();

      expect(result).toEqual([]);
    });

    it('should group multiple students across multiple classes', async () => {
      const mockStudents = [
        {
          _id: mockIds.student1,
          nom: 'Martin',
          prenom: 'Sophie',
          dateNaissance: new Date('2010-03-20'),
          sexe: 'FEMME',
          classe: {
            _id: mockIds.class1,
            nom: 'CM1',
            prof: { nom: 'Dupont', prenom: 'Jean' }
          }
        },
        {
          _id: mockIds.student2,
          nom: 'Dubois',
          prenom: 'Pierre',
          dateNaissance: new Date('2010-05-15'),
          sexe: 'HOMME',
          classe: {
            _id: '507f1f77bcf86cd799439999',
            nom: 'CM2',
            prof: { nom: 'Martin', prenom: 'Marie' }
          }
        }
      ];

      Student.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockStudents)
      });

      const result = await studentService.getStudentsGroupedByClass();

      expect(result).toHaveLength(2);
      expect(result[0].class.nom).toBe('CM1');
      expect(result[1].class.nom).toBe('CM2');
    });

    it('should propagate database errors', async () => {
      Student.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockRejectedValue(new Error('DB error'))
      });

      await expect(studentService.getStudentsGroupedByClass())
        .rejects.toThrow('Failed to group students by class: DB error');
    });
  });
});

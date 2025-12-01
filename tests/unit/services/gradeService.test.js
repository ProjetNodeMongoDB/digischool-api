const gradeService = require('../../../src/services/gradeService');
const Grade = require('../../../src/models/Grade');
const Student = require('../../../src/models/Student');
const Class = require('../../../src/models/Class');
const Subject = require('../../../src/models/Subject');
const Teacher = require('../../../src/models/Teacher');
const Trimester = require('../../../src/models/Trimester');
const { grades, students, classes, mockIds, edgeCases } = require('../mocks/fixtures');

jest.mock('../../../src/models/Grade');
jest.mock('../../../src/models/Student');
jest.mock('../../../src/models/Class');
jest.mock('../../../src/models/Subject');
jest.mock('../../../src/models/Teacher');
jest.mock('../../../src/models/Trimester');

describe('GradeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllGrades', () => {
    it('should return all grades with all references populated', async () => {
      const mockGrades = [grades.validWithPopulate];
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockGrades),
      };
      Grade.find.mockReturnValue(mockQuery);

      const result = await gradeService.getAllGrades();

      expect(Grade.find).toHaveBeenCalled();
      expect(mockQuery.populate).toHaveBeenCalledTimes(5);
      expect(mockQuery.populate).toHaveBeenCalledWith('ideleve', 'nom prenom dateNaissance');
      expect(mockQuery.populate).toHaveBeenCalledWith('idclasse', 'nom');
      expect(mockQuery.populate).toHaveBeenCalledWith('idmatiere', 'nom');
      expect(mockQuery.populate).toHaveBeenCalledWith('idprof', 'nom prenom');
      expect(mockQuery.populate).toHaveBeenCalledWith('idtrimestre', 'nom');
      expect(result).toEqual(mockGrades);
    });

    it('should return empty array when no grades', async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([]),
      };
      Grade.find.mockReturnValue(mockQuery);

      const result = await gradeService.getAllGrades();

      expect(result).toEqual([]);
    });

    it('should filter grades by student', async () => {
      const mockGrades = [grades.validWithPopulate];
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockGrades),
      };
      Grade.find.mockReturnValue(mockQuery);

      const result = await gradeService.getAllGrades({ student: mockIds.student1 });

      expect(Grade.find).toHaveBeenCalledWith({ ideleve: mockIds.student1 });
      expect(result).toEqual(mockGrades);
    });

    it('should filter grades by class', async () => {
      const mockGrades = [grades.validWithPopulate];
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockGrades),
      };
      Grade.find.mockReturnValue(mockQuery);

      const result = await gradeService.getAllGrades({ class: mockIds.class1 });

      expect(Grade.find).toHaveBeenCalledWith({ idclasse: mockIds.class1 });
      expect(result).toEqual(mockGrades);
    });

    it('should filter grades by subject', async () => {
      const mockGrades = [grades.validWithPopulate];
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockGrades),
      };
      Grade.find.mockReturnValue(mockQuery);

      const result = await gradeService.getAllGrades({ subject: mockIds.subject1 });

      expect(Grade.find).toHaveBeenCalledWith({ idmatiere: mockIds.subject1 });
      expect(result).toEqual(mockGrades);
    });

    it('should filter grades by trimester', async () => {
      const mockGrades = [grades.validWithPopulate];
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockGrades),
      };
      Grade.find.mockReturnValue(mockQuery);

      const result = await gradeService.getAllGrades({ trimester: mockIds.trimester1 });

      expect(Grade.find).toHaveBeenCalledWith({ idtrimestre: mockIds.trimester1 });
      expect(result).toEqual(mockGrades);
    });

    it('should propagate database errors', async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockRejectedValue(new Error('DB error')),
      };
      Grade.find.mockReturnValue(mockQuery);

      await expect(gradeService.getAllGrades()).rejects.toThrow('DB error');
    });
  });

  describe('getGradeById', () => {
    it('should return grade with all references populated', async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
      };
      mockQuery.populate
        .mockReturnValueOnce(mockQuery)
        .mockReturnValueOnce(mockQuery)
        .mockReturnValueOnce(mockQuery)
        .mockReturnValueOnce(mockQuery)
        .mockResolvedValue(grades.validWithPopulate);

      Grade.findById.mockReturnValue(mockQuery);

      const result = await gradeService.getGradeById(mockIds.grade1);

      expect(Grade.findById).toHaveBeenCalledWith(mockIds.grade1);
      expect(mockQuery.populate).toHaveBeenCalledTimes(5);
      expect(result).toEqual(grades.validWithPopulate);
    });

    it('should throw error when grade not found', async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
      };
      mockQuery.populate
        .mockReturnValueOnce(mockQuery)
        .mockReturnValueOnce(mockQuery)
        .mockReturnValueOnce(mockQuery)
        .mockReturnValueOnce(mockQuery)
        .mockResolvedValue(null);

      Grade.findById.mockReturnValue(mockQuery);

      await expect(gradeService.getGradeById(edgeCases.nonExistentId))
        .rejects.toThrow('Grade not found');
    });

    it('should handle invalid ObjectId format', async () => {
      const mockQuery = {
        populate: jest.fn(),
      };
      mockQuery.populate
        .mockReturnValueOnce(mockQuery)
        .mockReturnValueOnce(mockQuery)
        .mockReturnValueOnce(mockQuery)
        .mockReturnValueOnce(mockQuery)
        .mockRejectedValue(new Error('Cast to ObjectId failed'));

      Grade.findById.mockReturnValue(mockQuery);

      await expect(gradeService.getGradeById(edgeCases.invalidObjectId))
        .rejects.toThrow('Cast to ObjectId failed');
    });

    it('should propagate database errors', async () => {
      const mockQuery = {
        populate: jest.fn(),
      };
      mockQuery.populate
        .mockReturnValueOnce(mockQuery)
        .mockReturnValueOnce(mockQuery)
        .mockReturnValueOnce(mockQuery)
        .mockReturnValueOnce(mockQuery)
        .mockRejectedValue(new Error('Connection timeout'));

      Grade.findById.mockReturnValue(mockQuery);

      await expect(gradeService.getGradeById(mockIds.grade1))
        .rejects.toThrow('Connection timeout');
    });
  });

  describe('createGrade', () => {
    it('should create and return new grade with all validations', async () => {
      const newData = grades.validInput;
      const savedGrade = { ...newData, _id: mockIds.grade2 };

      Student.findById.mockResolvedValue({ ...students.valid, classe: mockIds.class1 });
      Class.findById.mockResolvedValue(classes.valid);
      Subject.findById.mockResolvedValue({ _id: mockIds.subject1, nom: 'Math' });
      Teacher.findById.mockResolvedValue({ _id: mockIds.teacher1, nom: 'Dupont' });
      Trimester.findById.mockResolvedValue({ _id: mockIds.trimester1, nom: 'T1' });

      Grade.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(savedGrade),
        _id: mockIds.grade2,
      }));

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
      };
      mockQuery.populate
        .mockReturnValueOnce(mockQuery)
        .mockReturnValueOnce(mockQuery)
        .mockReturnValueOnce(mockQuery)
        .mockReturnValueOnce(mockQuery)
        .mockResolvedValue(grades.validWithPopulate);

      Grade.findById.mockReturnValue(mockQuery);

      const result = await gradeService.createGrade(newData);

      expect(Student.findById).toHaveBeenCalledWith(newData.ideleve);
      expect(Class.findById).toHaveBeenCalledWith(newData.idclasse);
      expect(Subject.findById).toHaveBeenCalledWith(newData.idmatiere);
      expect(Teacher.findById).toHaveBeenCalledWith(newData.idprof);
      expect(Trimester.findById).toHaveBeenCalledWith(newData.idtrimestre);
      expect(result).toEqual(grades.validWithPopulate);
    });

    it('should throw error when student not found', async () => {
      Student.findById.mockResolvedValue(null);

      await expect(gradeService.createGrade(grades.validInput))
        .rejects.toThrow('Referenced student');
    });

    it('should throw error when class not found', async () => {
      Student.findById.mockResolvedValue({ ...students.valid, classe: mockIds.class1 });
      Class.findById.mockResolvedValue(null);

      await expect(gradeService.createGrade(grades.validInput))
        .rejects.toThrow('Referenced class');
    });

    it('should throw error when student not in specified class', async () => {
      Student.findById.mockResolvedValue({ ...students.valid, classe: mockIds.class2 });
      Class.findById.mockResolvedValue(classes.valid);

      await expect(gradeService.createGrade(grades.validInput))
        .rejects.toThrow('Student is not in the specified class');
    });

    it('should throw error when subject not found', async () => {
      Student.findById.mockResolvedValue({ ...students.valid, classe: mockIds.class1 });
      Class.findById.mockResolvedValue(classes.valid);
      Subject.findById.mockResolvedValue(null);

      await expect(gradeService.createGrade(grades.validInput))
        .rejects.toThrow('Referenced subject');
    });

    it('should throw error when teacher not found', async () => {
      Student.findById.mockResolvedValue({ ...students.valid, classe: mockIds.class1 });
      Class.findById.mockResolvedValue(classes.valid);
      Subject.findById.mockResolvedValue({ _id: mockIds.subject1 });
      Teacher.findById.mockResolvedValue(null);

      await expect(gradeService.createGrade(grades.validInput))
        .rejects.toThrow('Referenced teacher');
    });

    it('should throw error when trimester not found', async () => {
      Student.findById.mockResolvedValue({ ...students.valid, classe: mockIds.class1 });
      Class.findById.mockResolvedValue(classes.valid);
      Subject.findById.mockResolvedValue({ _id: mockIds.subject1 });
      Teacher.findById.mockResolvedValue({ _id: mockIds.teacher1 });
      Trimester.findById.mockResolvedValue(null);

      await expect(gradeService.createGrade(grades.validInput))
        .rejects.toThrow('Referenced trimester');
    });

    it('should handle Mongoose validation errors for invalid note', async () => {
      const error = new Error('Note must be between 0 and 20');

      Student.findById.mockResolvedValue({ ...students.valid, classe: mockIds.class1 });
      Class.findById.mockResolvedValue(classes.valid);
      Subject.findById.mockResolvedValue({ _id: mockIds.subject1 });
      Teacher.findById.mockResolvedValue({ _id: mockIds.teacher1 });
      Trimester.findById.mockResolvedValue({ _id: mockIds.trimester1 });

      Grade.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(error),
      }));

      await expect(gradeService.createGrade(grades.invalidNote))
        .rejects.toThrow('Note must be between 0 and 20');
    });

    it('should handle invalid ObjectId for references', async () => {
      Student.findById.mockRejectedValue(new Error('Cast to ObjectId failed'));

      await expect(gradeService.createGrade(grades.invalidReference))
        .rejects.toThrow('Cast to ObjectId failed');
    });
  });

  describe('updateGrade', () => {
    it('should update and return grade', async () => {
      const updateData = { note: 19 };
      const updated = { ...grades.validWithPopulate, ...updateData };

      Grade.findById.mockResolvedValue(grades.valid);

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
      };
      mockQuery.populate
        .mockReturnValueOnce(mockQuery)
        .mockReturnValueOnce(mockQuery)
        .mockReturnValueOnce(mockQuery)
        .mockReturnValueOnce(mockQuery)
        .mockResolvedValue(updated);

      Grade.findByIdAndUpdate.mockReturnValue(mockQuery);

      const result = await gradeService.updateGrade(mockIds.grade1, updateData);

      expect(Grade.findById).toHaveBeenCalledWith(mockIds.grade1);
      expect(Grade.findByIdAndUpdate).toHaveBeenCalledWith(
        mockIds.grade1,
        updateData,
        { new: true, runValidators: true }
      );
      expect(result.note).toBe(19);
    });

    it('should throw error when grade not found on initial check', async () => {
      Grade.findById.mockResolvedValue(null);

      await expect(gradeService.updateGrade(edgeCases.nonExistentId, { note: 19 }))
        .rejects.toThrow('Grade not found');
    });

    it('should validate new student if being updated', async () => {
      const updateData = { ideleve: mockIds.student2 };
      const updated = { ...grades.validWithPopulate, ...updateData };

      Grade.findById.mockResolvedValue(grades.valid);
      Student.findById.mockResolvedValue({ ...students.valid, classe: mockIds.class1 });

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
      };
      mockQuery.populate
        .mockReturnValueOnce(mockQuery)
        .mockReturnValueOnce(mockQuery)
        .mockReturnValueOnce(mockQuery)
        .mockReturnValueOnce(mockQuery)
        .mockResolvedValue(updated);

      Grade.findByIdAndUpdate.mockReturnValue(mockQuery);

      const result = await gradeService.updateGrade(mockIds.grade1, updateData);

      expect(Student.findById).toHaveBeenCalledWith(updateData.ideleve);
      expect(result).toEqual(updated);
    });

    it('should throw error when new student not found', async () => {
      const updateData = { ideleve: mockIds.student2 };

      Grade.findById.mockResolvedValue(grades.valid);
      Student.findById.mockResolvedValue(null);

      await expect(gradeService.updateGrade(mockIds.grade1, updateData))
        .rejects.toThrow('Referenced student');
    });

    it('should validate new class if being updated', async () => {
      const updateData = { idclasse: mockIds.class2 };
      const updated = { ...grades.validWithPopulate, ...updateData };

      Grade.findById.mockResolvedValue(grades.valid);
      Class.findById.mockResolvedValue({ _id: mockIds.class2 });
      Student.findById.mockResolvedValue({ ...students.valid, classe: mockIds.class2 });

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
      };
      mockQuery.populate
        .mockReturnValueOnce(mockQuery)
        .mockReturnValueOnce(mockQuery)
        .mockReturnValueOnce(mockQuery)
        .mockReturnValueOnce(mockQuery)
        .mockResolvedValue(updated);

      Grade.findByIdAndUpdate.mockReturnValue(mockQuery);

      const result = await gradeService.updateGrade(mockIds.grade1, updateData);

      expect(Class.findById).toHaveBeenCalledWith(updateData.idclasse);
      expect(result).toEqual(updated);
    });

    it('should throw error when student not in new class', async () => {
      const updateData = { idclasse: mockIds.class2 };

      Grade.findById.mockResolvedValue(grades.valid);
      Class.findById.mockResolvedValue({ _id: mockIds.class2 });
      Student.findById.mockResolvedValue({ ...students.valid, classe: mockIds.class1 });

      await expect(gradeService.updateGrade(mockIds.grade1, updateData))
        .rejects.toThrow('Student is not in the specified class');
    });

    it('should propagate database errors', async () => {
      Grade.findById.mockResolvedValue(grades.valid);

      const mockQuery = {
        populate: jest.fn(),
      };
      mockQuery.populate
        .mockReturnValueOnce(mockQuery)
        .mockReturnValueOnce(mockQuery)
        .mockReturnValueOnce(mockQuery)
        .mockReturnValueOnce(mockQuery)
        .mockRejectedValue(new Error('DB error'));

      Grade.findByIdAndUpdate.mockReturnValue(mockQuery);

      await expect(gradeService.updateGrade(mockIds.grade1, { note: 19 }))
        .rejects.toThrow('DB error');
    });
  });

  describe('deleteGrade', () => {
    it('should delete and return grade', async () => {
      Grade.findByIdAndDelete.mockResolvedValue(grades.valid);

      const result = await gradeService.deleteGrade(mockIds.grade1);

      expect(Grade.findByIdAndDelete).toHaveBeenCalledWith(mockIds.grade1);
      expect(result).toEqual(grades.valid);
    });

    it('should throw error when grade not found', async () => {
      Grade.findByIdAndDelete.mockResolvedValue(null);

      await expect(gradeService.deleteGrade(edgeCases.nonExistentId))
        .rejects.toThrow('Grade not found');
    });

    it('should propagate database errors', async () => {
      Grade.findByIdAndDelete.mockRejectedValue(new Error('DB error'));

      await expect(gradeService.deleteGrade(mockIds.grade1))
        .rejects.toThrow('DB error');
    });
  });
});

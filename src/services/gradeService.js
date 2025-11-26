const Grade = require('../models/Grade');
const Student = require('../models/Student');
const Class = require('../models/Class');
const Subject = require('../models/Subject');
const Teacher = require('../models/Teacher');
const Trimester = require('../models/Trimester');

class GradeService {
  async getAllGrades(filters = {}) {
    const query = {};

    // Build filter object from query params
    if (filters.student) query.ideleve = filters.student;
    if (filters.class) query.idclasse = filters.class;
    if (filters.subject) query.idmatiere = filters.subject;
    if (filters.trimester) query.idtrimestre = filters.trimester;

    return await Grade.find(query)
      .populate('ideleve', 'nom prenom')
      .populate('idclasse', 'nom')
      .populate('idmatiere', 'nom')
      .populate('idprof', 'nom prenom')
      .populate('idtrimestre', 'nom')
      .sort({ createdAt: -1 });
  }

  async getGradeById(id) {
    const grade = await Grade.findById(id)
      .populate('ideleve', 'nom prenom dateNaissance')
      .populate('idclasse', 'nom')
      .populate('idmatiere', 'nom')
      .populate('idprof', 'nom prenom')
      .populate('idtrimestre', 'nom date');

    if (!grade) {
      throw new Error('Grade not found');
    }

    return grade;
  }

  async createGrade(gradeData) {
    // Verify all referenced entities exist
    const student = await Student.findById(gradeData.ideleve);
    if (!student) {
      throw new Error('Student not found');
    }

    const classe = await Class.findById(gradeData.idclasse);
    if (!classe) {
      throw new Error('Class not found');
    }

    const subject = await Subject.findById(gradeData.idmatiere);
    if (!subject) {
      throw new Error('Subject not found');
    }

    const teacher = await Teacher.findById(gradeData.idprof);
    if (!teacher) {
      throw new Error('Teacher not found');
    }

    const trimester = await Trimester.findById(gradeData.idtrimestre);
    if (!trimester) {
      throw new Error('Trimester not found');
    }

    const grade = new Grade(gradeData);
    await grade.save();

    // Fetch the saved document with all populated references
    return await Grade.findById(grade._id)
      .populate('ideleve', 'nom prenom')
      .populate('idclasse', 'nom')
      .populate('idmatiere', 'nom')
      .populate('idprof', 'nom prenom')
      .populate('idtrimestre', 'nom');
  }

  async updateGrade(id, gradeData) {
    // Verify referenced entities exist if they're being updated
    if (gradeData.ideleve) {
      const student = await Student.findById(gradeData.ideleve);
      if (!student) {
        throw new Error('Student not found');
      }
    }

    if (gradeData.idclasse) {
      const classe = await Class.findById(gradeData.idclasse);
      if (!classe) {
        throw new Error('Class not found');
      }
    }

    if (gradeData.idmatiere) {
      const subject = await Subject.findById(gradeData.idmatiere);
      if (!subject) {
        throw new Error('Subject not found');
      }
    }

    if (gradeData.idprof) {
      const teacher = await Teacher.findById(gradeData.idprof);
      if (!teacher) {
        throw new Error('Teacher not found');
      }
    }

    if (gradeData.idtrimestre) {
      const trimester = await Trimester.findById(gradeData.idtrimestre);
      if (!trimester) {
        throw new Error('Trimester not found');
      }
    }

    const grade = await Grade.findByIdAndUpdate(
      id,
      gradeData,
      { new: true, runValidators: true }
    )
      .populate('ideleve', 'nom prenom')
      .populate('idclasse', 'nom')
      .populate('idmatiere', 'nom')
      .populate('idprof', 'nom prenom')
      .populate('idtrimestre', 'nom');

    if (!grade) {
      throw new Error('Grade not found');
    }

    return grade;
  }

  async deleteGrade(id) {
    const grade = await Grade.findByIdAndDelete(id);

    if (!grade) {
      throw new Error('Grade not found');
    }

    return grade;
  }
}

module.exports = new GradeService();

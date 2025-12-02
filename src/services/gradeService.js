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
      .populate('ideleve', 'nom prenom dateNaissance')
      .populate('idclasse', 'nom')
      .populate('idmatiere', 'nom')
      .populate('idprof', 'nom prenom')
      .populate('idtrimestre', 'nom')
      .sort({ createdAt: -1 });
  }

  /**
   * Get students with their grades filtered by teacher
   * Groups grades by student, showing all grades given by specific teacher
   * Useful for teacher dashboards to view all students they teach
   * @param {string} teacherId - Teacher ObjectId
   * @returns {Promise<Array>} Array of objects with student info and grades array
   * @throws {Error} If teacher not found
   * @example
   * const data = await gradeService.getStudentsWithGradesByTeacher('507f1f77bcf86cd799439011');
   * // Returns: [{ student: {...}, grades: [...] }, ...]
   */
  async getStudentsWithGradesByTeacher(teacherId) {
    // Verify teacher exists
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      const error = new Error('Teacher not found');
      error.statusCode = 404;
      throw error;
    }

    // Find all grades given by this teacher with populated references
    const grades = await Grade.find({ idprof: teacherId })
      .populate('ideleve', 'nom prenom dateNaissance')
      .populate('idmatiere', 'nom')
      .populate('idtrimestre', 'nom')
      .populate('idclasse', 'nom')
      .sort({ ideleve: 1, idtrimestre: 1, idmatiere: 1 });

    // Group grades by student using Map for O(1) lookup
    const studentMap = new Map();

    grades.forEach(grade => {
      const studentId = grade.ideleve._id.toString();

      // Initialize student entry if not exists
      if (!studentMap.has(studentId)) {
        studentMap.set(studentId, {
          student: {
            _id: grade.ideleve._id,
            nom: grade.ideleve.nom,
            prenom: grade.ideleve.prenom,
            dateNaissance: grade.ideleve.dateNaissance
          },
          grades: []
        });
      }

      // Add grade to student's grades array
      studentMap.get(studentId).grades.push({
        _id: grade._id,
        note: grade.note,
        coefficient: grade.coefficient,
        matiere: grade.idmatiere,
        trimestre: grade.idtrimestre,
        classe: grade.idclasse,
        createdAt: grade.createdAt
      });
    });

    return Array.from(studentMap.values());
  }

  /**
   * Retrieves grades grouped by subject with optional trimester and class filters.
   * Uses JavaScript grouping for simplicity and junior developer readability.
   * @param {Object} filters - Optional filters (class, trimester)
   * @returns {Promise<Array>} Array of subjects with nested student grades, sorted by student name
   * @throws {Error} If grouping fails
   */
  async getGradesGroupedBySubject(filters = {}) {
    try {
      const query = {};

      // Reuse existing filter logic (only class and trimester for grouped view)
      if (filters.class) query.idclasse = filters.class;
      if (filters.trimester) query.idtrimestre = filters.trimester;

      // Fetch grades with populated references, sorted by student name alphabetically
      const grades = await Grade.find(query)
        .populate('ideleve', 'nom prenom')
        .populate('idmatiere', 'nom')
        .populate('idprof', 'nom prenom')
        .sort({ 'ideleve.nom': 1 });

      // Group by subject using JavaScript (simple, readable)
      const groupedBySubject = {};

      grades.forEach(grade => {
        const subjectId = grade.idmatiere._id.toString();

        if (!groupedBySubject[subjectId]) {
          groupedBySubject[subjectId] = {
            subject: {
              _id: grade.idmatiere._id,
              nom: grade.idmatiere.nom
            },
            grades: []
          };
        }

        groupedBySubject[subjectId].grades.push({
          student: {
            nom: grade.ideleve.nom,
            prenom: grade.ideleve.prenom
          },
          note: grade.note,
          coefficient: grade.coefficient,
          teacher: {
            nom: grade.idprof.nom,
            prenom: grade.idprof.prenom
          }
        });
      });

      return Object.values(groupedBySubject);
    } catch (error) {
      throw new Error(`Failed to group grades by subject: ${error.message}`);
    }
  }

  async getGradeById(id) {
    const grade = await Grade.findById(id)
      .populate('ideleve', 'nom prenom dateNaissance')
      .populate('idclasse', 'nom')
      .populate('idmatiere', 'nom')
      .populate('idprof', 'nom prenom')
      .populate('idtrimestre', 'nom date');

    // NOTE: This check only verifies if the Grade document exists.
    // It does NOT validate if the referenced entities (student, class, subject, teacher, trimester) exist.
    // If a reference ID doesn't exist, .populate() returns null for that field without throwing an error.
    // Reference validation is performed in createGrade() and updateGrade() before saving.
    if (!grade) {
      throw new Error('Grade not found');
    }

    return grade;
  }

  async createGrade(gradeData) {
    // Verify all referenced entities exist before CREATE operation
    // If validation fails here, it means the CREATE operation cannot proceed
    // because one or more referenced entities don't exist in the database
    const student = await Student.findById(gradeData.ideleve);
    if (!student) {
      throw new Error(`Referenced student (${gradeData.ideleve}) not found`);
    }

    const classe = await Class.findById(gradeData.idclasse);
    if (!classe) {
      throw new Error(`Referenced class (${gradeData.idclasse}) not found`);
    }

    // Verify student belongs to the specified class
    if (student.classe.toString() !== gradeData.idclasse.toString()) {
      throw new Error('Student is not in the specified class');
    }

    const subject = await Subject.findById(gradeData.idmatiere);
    if (!subject) {
      throw new Error(`Referenced subject (${gradeData.idmatiere}) not found`);
    }

    const teacher = await Teacher.findById(gradeData.idprof);
    if (!teacher) {
      throw new Error(`Referenced teacher (${gradeData.idprof}) not found`);
    }

    const trimester = await Trimester.findById(gradeData.idtrimestre);
    if (!trimester) {
      throw new Error(`Referenced trimester (${gradeData.idtrimestre}) not found`);
    }

    const grade = new Grade(gradeData);
    await grade.save();

    // Fetch the saved document with all populated references
    return await Grade.findById(grade._id)
      .populate('ideleve', 'nom prenom dateNaissance')
      .populate('idclasse', 'nom')
      .populate('idmatiere', 'nom')
      .populate('idprof', 'nom prenom')
      .populate('idtrimestre', 'nom');
  }

  async updateGrade(id, gradeData) {
    // Verify referenced entities exist if they're being updated in UPDATE operation
    // If validation fails here, it means the UPDATE operation cannot proceed
    // because one or more referenced entities don't exist in the database
    //
    // ANSWER: createGrade validates ALL 5 refs (mandatory), updateGrade validates ONLY changed refs (partial updates)
    // TODO: Optimize validation code - consider extracting validation logic to reduce duplication

    // Fetch current grade to validate student-class relationship when updating
    const currentGrade = await Grade.findById(id);
    if (!currentGrade) {
      throw new Error('Grade not found');
    }

    let student;
    if (gradeData.ideleve) {
      student = await Student.findById(gradeData.ideleve);
      if (!student) {
        throw new Error(`Referenced student (${gradeData.ideleve}) not found`);
      }
    }

    let classe;
    if (gradeData.idclasse) {
      classe = await Class.findById(gradeData.idclasse);
      if (!classe) {
        throw new Error(`Referenced class (${gradeData.idclasse}) not found`);
      }
    }

    // Verify student belongs to class when either is being updated
    if (gradeData.ideleve || gradeData.idclasse) {
      const studentToCheck = student || await Student.findById(currentGrade.ideleve);
      const classToCheck = gradeData.idclasse || currentGrade.idclasse;

      if (studentToCheck.classe.toString() !== classToCheck.toString()) {
        throw new Error('Student is not in the specified class');
      }
    }

    if (gradeData.idmatiere) {
      const subject = await Subject.findById(gradeData.idmatiere);
      if (!subject) {
        throw new Error(`Referenced subject (${gradeData.idmatiere}) not found`);
      }
    }

    if (gradeData.idprof) {
      const teacher = await Teacher.findById(gradeData.idprof);
      if (!teacher) {
        throw new Error(`Referenced teacher (${gradeData.idprof}) not found`);
      }
    }

    if (gradeData.idtrimestre) {
      const trimester = await Trimester.findById(gradeData.idtrimestre);
      if (!trimester) {
        throw new Error(`Referenced trimester (${gradeData.idtrimestre}) not found`);
      }
    }

    const grade = await Grade.findByIdAndUpdate(
      id,
      gradeData,
      { new: true, runValidators: true }
    )
      .populate('ideleve', 'nom prenom dateNaissance')
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

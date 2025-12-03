const Student = require('../models/Student');

class StudentService {
  // Get all students with class population
  async getAllStudents() {
    return await Student.find()
      .sort({ nom: 1, prenom: 1 });
  }

  // Get student by ID with class population
  async getStudentById(id) {
    const student = await Student.findById(id);

    if (!student) {
      throw new Error('Student not found');
    }
    return student;
  }

  // Create new student
  async createStudent(studentData) {
    const student = new Student(studentData);
    await student.save();
    return student;
  }

  // Update student
  async updateStudent(id, updateData) {
    const student = await Student.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!student) {
      throw new Error('Student not found');
    }
    return student;
  }

  // Delete student
  async deleteStudent(id) {
    const student = await Student.findByIdAndDelete(id);
    if (!student) {
      throw new Error('Student not found');
    }
    return student;
  }

  /**
   * Get students in a specific class
   * @param {string} classId - Class ObjectId
   * @returns {Promise<Array>} Students in this class, sorted by name
   * @throws {Error} If class doesn't exist
   */
  async getStudentsByClass(classId) {
    const Class = require('../models/Class');

    // Verify class exists first
    const classExists = await Class.findById(classId);
    if (!classExists) {
      const error = new Error('Class not found');
      error.statusCode = 404;
      throw error;
    }

    // Find students in this class with population
    const students = await Student.find({ classe: classId })
      .populate({
        path: 'classe',
        select: 'nom',
        populate: {
          path: 'prof',
          select: 'nom prenom'
        }
      })
      .sort({ nom: 1, prenom: 1 });

    return students;
  }

  /**
   * Get students grouped by class
   * Returns all students organized by their classes for academic reporting
   * @returns {Promise<Array>} Array of classes with nested students array
   * @throws {Error} If grouping fails
   * @example
   * const data = await studentService.getStudentsGroupedByClass();
   * // Returns: [{ class: {...}, students: [...] }, ...]
   */
  async getStudentsGroupedByClass() {
    try {
      // Fetch all students with populated class and teacher info
      const students = await Student.find()
        .populate({
          path: 'classe',
          select: 'nom',
          populate: {
            path: 'prof',
            select: 'nom prenom'
          }
        })
        .sort({ nom: 1, prenom: 1 });

      // Group students by class using JavaScript grouping
      const groupedByClass = {};

      students.forEach(student => {
        // Skip students without assigned class
        if (!student.classe) {
          return;
        }

        const classId = student.classe._id.toString();

        if (!groupedByClass[classId]) {
          groupedByClass[classId] = {
            class: {
              _id: student.classe._id,
              nom: student.classe.nom,
              prof: student.classe.prof ? {
                nom: student.classe.prof.nom,
                prenom: student.classe.prof.prenom
              } : null
            },
            students: []
          };
        }

        // Add student to class group
        groupedByClass[classId].students.push({
          _id: student._id,
          nom: student.nom,
          prenom: student.prenom,
          dateNaissance: student.dateNaissance,
          sexe: student.sexe,
          adresse: student.adresse
        });
      });

      return Object.values(groupedByClass);
    } catch (error) {
      throw new Error(`Failed to group students by class: ${error.message}`);
    }
  }
}

module.exports = new StudentService();

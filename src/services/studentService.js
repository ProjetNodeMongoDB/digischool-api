const Student = require('../models/Student');

class StudentService {
  // Get all students with class population
  async getAllStudents() {
    return await Student.find()
      .sort({ nom: 1 });
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
   */
  async getStudentsByClass(classId) {
    return await Student.find({ classe: classId })
      .populate('classe', 'nom')
      .sort({ nom: 1, prenom: 1 });
  }
}

module.exports = new StudentService();

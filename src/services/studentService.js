const Student = require('../models/Student');

class StudentService {
  // Get all students with class population
  async getAllStudents() {
    return await Student.find()
      .populate('classe', 'nom')
      .sort({ nom: 1 });
  }

  // Get student by ID with class population
  async getStudentById(id) {
    const student = await Student.findById(id)
      .populate('classe', 'nom');

    if (!student) {
      throw new Error('Student not found');
    }
    return student;
  }

  // Create new student
  async createStudent(studentData) {
    const student = new Student(studentData);
    await student.save();
    return await student.populate('classe', 'nom');
  }

  // Update student
  async updateStudent(id, updateData) {
    const student = await Student.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('classe', 'nom');

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
}

module.exports = new StudentService();

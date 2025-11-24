const Teacher = require('../models/Teacher');

class TeacherService {
  // Get all teachers
  async getAllTeachers() {
    return await Teacher.find().sort({ nom: 1 });
  }

  // Get teacher by ID
  async getTeacherById(id) {
    const teacher = await Teacher.findById(id);
    if (!teacher) {
      throw new Error('Teacher not found');
    }
    return teacher;
  }

  // Create new teacher
  async createTeacher(teacherData) {
    const teacher = new Teacher(teacherData);
    return await teacher.save();
  }

  // Update teacher
  async updateTeacher(id, updateData) {
    const teacher = await Teacher.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!teacher) {
      throw new Error('Teacher not found');
    }
    return teacher;
  }

  // Delete teacher
  async deleteTeacher(id) {
    const teacher = await Teacher.findByIdAndDelete(id);
    if (!teacher) {
      throw new Error('Teacher not found');
    }
    return teacher;
  }
}

module.exports = new TeacherService();

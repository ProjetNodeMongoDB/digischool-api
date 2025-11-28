const Teacher = require('../models/Teacher');
const Class = require('../models/Class');

class TeacherService {
  // Get all teachers
  async getAllTeachers() {
    return await Teacher.find().sort({ nom: 1 });
  }

  /**
   * Get teachers by class ID
   * This performs a reverse lookup since Teacher model doesn't have classe field
   * @param {string} classId - MongoDB ObjectId of the class
   * @returns {Promise<Array>} Array containing the teacher assigned to the class
   */
  async getTeachersByClass(classId) {
    const classe = await Class.findById(classId).populate('prof');
    if (!classe) {
      throw new Error('Class not found');
    }
    return classe.prof ? [classe.prof] : [];
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

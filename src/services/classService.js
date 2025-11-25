const Class = require('../models/Class');
const Teacher = require('../models/Teacher');

class ClassService {
  async getAllClasses() {
    return await Class.find().populate('prof', 'nom prenom').sort({ nom: 1 });
  }

  async getClassById(id) {
    const classe = await Class.findById(id).populate('prof', 'nom prenom');
    if (!classe) {
      throw new Error('Class not found');
    }
    return classe;
  }

  async createClass(classData) {
    // Verify teacher exists
    const teacher = await Teacher.findById(classData.prof);
    if (!teacher) {
      throw new Error('Teacher not found');
    }

    const classe = new Class(classData);
    await classe.save();

    // Fetch the saved document with populated teacher
    return await Class.findById(classe._id).populate('prof', 'nom prenom');
  }

  async updateClass(id, updateData) {
    // Verify teacher exists if prof is being updated
    if (updateData.prof) {
      const teacher = await Teacher.findById(updateData.prof);
      if (!teacher) {
        throw new Error('Teacher not found');
      }
    }

    const classe = await Class.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('prof', 'nom prenom');

    if (!classe) {
      throw new Error('Class not found');
    }
    return classe;
  }

  async deleteClass(id) {
    const classe = await Class.findByIdAndDelete(id);
    if (!classe) {
      throw new Error('Class not found');
    }
    return classe;
  }
}

module.exports = new ClassService();

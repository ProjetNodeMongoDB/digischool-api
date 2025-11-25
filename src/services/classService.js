const Class = require('../models/Class');

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
    const classe = new Class(classData);
    await classe.save();
    return await classe.populate('prof', 'nom prenom');
  }

  async updateClass(id, updateData) {
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

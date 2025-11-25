const Trimester = require('../models/Trimester');

class TrimesterService {
  // Get all trimesters
  async getAllTrimesters() {
    return await Trimester.find().sort({ date: 1 });
  }

  // Get trimester by ID
  async getTrimesterById(id) {
    const trimester = await Trimester.findById(id);
    if (!trimester) {
      throw new Error('Trimester not found');
    }
    return trimester;
  }

  // Create new trimester
  async createTrimester(trimesterData) {
    const trimester = new Trimester(trimesterData);
    return await trimester.save();
  }

  // Update trimester
  async updateTrimester(id, updateData) {
    const trimester = await Trimester.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!trimester) {
      throw new Error('Trimester not found');
    }
    return trimester;
  }

  // Delete trimester
  async deleteTrimester(id) {
    const trimester = await Trimester.findByIdAndDelete(id);
    if (!trimester) {
      throw new Error('Trimester not found');
    }
    return trimester;
  }
}

module.exports = new TrimesterService();

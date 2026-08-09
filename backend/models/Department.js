const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  hodRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Ensure unique department name per HOD
departmentSchema.index({ name: 1, hodRef: 1 }, { unique: true });

module.exports = mongoose.model('Department', departmentSchema);

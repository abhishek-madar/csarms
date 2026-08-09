const mongoose = require('mongoose');

const academicSchema = new mongoose.Schema({
  studentRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  semester: {
    type: Number,
    default: 1
  },
  marks: {
    type: Number,
    default: 0
  },
  totalMarks: {
    type: Number,
    default: 100
  },
  attendance: {
    type: Number,
    default: 0 // percentage
  }
}, { timestamps: true });

module.exports = mongoose.model('Academic', academicSchema);

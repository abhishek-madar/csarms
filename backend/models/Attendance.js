const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  courseRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  slot: {
    type: Number,
    required: true // e.g., 1 to 6
  },
  semester: {
    type: Number,
    required: true,
    default: 1
  },
  records: [{
    studentRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['P', 'A', 'NA', '-'],
      default: 'P'
    }
  }]
}, { timestamps: true });

// Ensure a course cannot have duplicate slots on the exact same date for a semester
attendanceSchema.index({ courseRef: 1, date: 1, slot: 1, semester: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);

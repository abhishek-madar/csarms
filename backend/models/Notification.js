const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Event', 'Holiday', 'Emergency', 'Advertisement', 'Announcement', 'AcademicAlert', 'SystemAlert', 'FacultyAlert'],
    required: true
  },
  senderRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipientRoles: [{
    type: String,
    enum: ['Student', 'Faculty', 'HOD', 'Admin', 'ALL']
  }],
  targetUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // If null, applies to all users in recipientRole
    default: null
  },
  expiresAt: {
    type: Date,
    required: true
  },
  mediaUrl: {
    type: String,
    default: null
  },
  mediaType: {
    type: String, // 'image', 'video', etc.
    default: null
  }
}, { timestamps: true });

// TTL Index to automatically delete expired notifications
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Notification', notificationSchema);

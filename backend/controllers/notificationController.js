const Notification = require('../models/Notification');

// Get active notifications for the logged in user
const getNotifications = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;

    // A notification is valid if:
    // 1. It hasn't expired (handled by TTL mostly, but good to filter just in case)
    // 2. recipientRoles contains 'ALL' OR contains userRole
    // 3. targetUserId is null OR matches userId
    
    const notifications = await Notification.find({
      expiresAt: { $gt: new Date() },
      $and: [
        {
          $or: [
            { recipientRoles: 'ALL' },
            { recipientRoles: userRole }
          ]
        },
        {
          $or: [
            { targetUserId: null },
            { targetUserId: userId }
          ]
        }
      ]
    })
    .populate('senderRef', 'name role _id')
    .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new notification (HOD/Faculty/Admin)
const createNotification = async (req, res) => {
  try {
    console.log('Create Notification Debug - User:', req.user);
    console.log('Create Notification Debug - Body:', req.body);
    console.log('Create Notification Debug - File:', req.file);

    const { title, message, type, durationHours } = req.body;
    let targetUserId = req.body.targetUserId || null;
    let recipientRoles = [];

    // Determine recipient roles based on sender role
    if (req.user.role === 'Faculty') {
      recipientRoles = ['HOD', 'Student'];
    } else if (req.user.role === 'HOD') {
      recipientRoles = ['Faculty', 'Student'];
    } else if (req.user.role === 'Admin') {
      // Admin can specify or defaults to ALL
      recipientRoles = req.body.recipientRoles ? JSON.parse(req.body.recipientRoles) : ['ALL'];
    }

    // Calculate expiry
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + (Number(durationHours) || 24)); // Default 24h

    // Handle media
    let mediaUrl = null;
    let mediaType = null;
    if (req.file) {
      mediaUrl = `/uploads/${req.file.filename}`;
      mediaType = req.file.mimetype.startsWith('video') ? 'video' : 'image';
    }

    const notification = await Notification.create({
      title,
      message,
      type,
      senderRef: req.user.id,
      recipientRoles,
      targetUserId,
      expiresAt,
      mediaUrl,
      mediaType
    });

    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ 
      message: error.message,
      debugInfo: {
        bodyKeys: Object.keys(req.body || {}),
        hasFile: !!req.file,
        userRole: req.user?.role
      }
    });
  }
};

// Delete notification (Admin only or sender)
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (req.user.role !== 'Admin' && notification.senderRef.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this notification' });
    }

    await notification.deleteOne();
    res.json({ message: 'Notification removed' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getNotifications, createNotification, deleteNotification };

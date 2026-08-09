const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Notification = require('../models/Notification');

const clearDummyNotifications = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const result = await Notification.deleteMany({
      $or: [
        { title: 'Academic Record Updated' },
        { message: /dummy/i }
      ]
    });

    console.log(`Deleted ${result.deletedCount} notifications.`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

clearDummyNotifications();

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const Attendance = require('../models/Attendance');

const fixIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const collection = mongoose.connection.collection('attendances');
    
    // List current indexes
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes.map(i => i.name));

    // Drop the old index if it exists
    if (indexes.find(i => i.name === 'courseRef_1_date_1_slot_1')) {
      await collection.dropIndex('courseRef_1_date_1_slot_1');
      console.log('Dropped old index: courseRef_1_date_1_slot_1');
    }

    // Ensure the new index is created
    await Attendance.syncIndexes();
    console.log('Synchronized indexes with schema.');

    const newIndexes = await collection.indexes();
    console.log('Final indexes:', newIndexes.map(i => i.name));

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixIndexes();

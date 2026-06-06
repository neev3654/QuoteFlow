require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User.model');

const seedUsers = async () => {
  try {
    await connectDB();

    const usersToSeed = [
      {
        name: 'QuoteFlow Admin',
        email: 'admin@quoteflow.com',
        password: 'Admin@12345',
        role: 'admin',
      },
      {
        name: 'Procurement Manager',
        email: 'manager@quoteflow.com',
        password: 'Manager@12345',
        role: 'manager',
      },
      {
        name: 'Procurement Officer',
        email: 'officer@quoteflow.com',
        password: 'Officer@12345',
        role: 'procurement_officer',
      },
    ];

    for (const userData of usersToSeed) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        await User.create(userData);
        console.log(`User created: ${userData.email} (${userData.role})`);
      } else {
        console.log(`User already exists: ${userData.email}`);
      }
    }

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedUsers();

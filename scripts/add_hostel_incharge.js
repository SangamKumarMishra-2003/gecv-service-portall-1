const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const User = require('../models/User').default || require('../models/User');
const connectToDatabase = require('../lib/db').default || require('../lib/db');

async function addHostelIncharge() {
  await connectToDatabase();
  const email = 'hostel@gecv.ac.in';
  const password = 'password123';
  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Hostel incharge user already exists.');
    process.exit(0);
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({
    name: 'Hostel Incharge',
    email,
    role: 'hostel-incharge',
    password: hashedPassword,
    mobile: '9876543213',
  });
  console.log('Hostel incharge user created:', email);
  process.exit(0);
}

addHostelIncharge();
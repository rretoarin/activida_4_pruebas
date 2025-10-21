require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const usersToSeed = [
      { username: 'admin', password: 'password123' },
      { username: 'user',  password: 'password456' }
    ];

    for (const u of usersToSeed) {
      const exists = await User.findOne({ username: u.username }).exec();
      if (exists) {
        console.log(`El usuario '${u.username}' ya existe — se omite.`);
        continue;
      }

      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(u.password, salt);

      const newUser = new User({ username: u.username, password: hashed });
      await newUser.save();
      console.log(`Usuario '${u.username}' creado.`);
    }

    console.log('Seed finalizado.');
    process.exit(0);
  } catch (err) {
    console.error('Error en seed:', err);
    process.exit(1);
  }
}

seed();



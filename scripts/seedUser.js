const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function seedUsers() {
  try {
    const existingAdmin = await User.findOne({ username: 'admin' });
    if (!existingAdmin) {
      const hashed = await bcrypt.hash('admin123', 10);
      await User.create({
        username: 'admin',
        password: hashed,
        role: 'admin'
      });
      console.log('✅ Usuario admin creado: admin / admin123');
    } else {
      console.log('ℹ️ Usuario admin ya existe');
    }
  } catch (error) {
    console.error('❌ Error al crear usuario admin:', error);
    throw error;
  }
}

module.exports = seedUsers;








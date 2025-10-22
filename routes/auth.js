const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const router = express.Router();

// --- LOGIN ---
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username }).exec();
    if (!user) return res.status(400).json({ message: '❌ Usuario no encontrado' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: '❌ Contraseña incorrecta' });

    // Guardamos también el rol en la sesión
    req.session.user = { username: user.username, role: user.role };
    return res.json({ message: '✅ Login exitoso', redirect: '/panel' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '⚠️ Error en el servidor' });
  }
});

// --- REGISTRO (solo admin) ---
router.post('/register', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'admin') {
      return res.status(403).json({ message: '🚫 Solo el admin puede registrar usuarios' });
    }

    const { newUsername, newPassword } = req.body;
    if (!newUsername || !newPassword) {
      return res.status(400).json({ message: '❗ Todos los campos son obligatorios' });
    }

    const existingUser = await User.findOne({ username: newUsername }).exec();
    if (existingUser) return res.status(400).json({ message: '⚠️ El usuario ya existe' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);

    // Todos los nuevos usuarios creados por admin tendrán rol "usuario"
    const newUser = new User({ username: newUsername, password: hashed, role: 'usuario' });
    await newUser.save();

    res.json({ message: `✅ Usuario '${newUsername}' registrado correctamente con rol 'usuario'` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '⚠️ Error al registrar usuario' });
  }
});

// --- LOGOUT ---
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
      return res.status(500).json({ message: '⚠️ Error al cerrar sesión' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: '👋 Sesión cerrada correctamente', redirect: '/' });
  });
});

module.exports = router;
















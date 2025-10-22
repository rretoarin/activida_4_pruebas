const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const router = express.Router();
const loginAttempts = {};

// Credenciales admin hardcodeadas
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin123';

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Bloqueo por intentos fallidos
    if (loginAttempts[username] && loginAttempts[username].count >= 3) {
      const elapsed = Date.now() - loginAttempts[username].time;
      if (elapsed < 15 * 60 * 1000) {
        return res.status(403).json({ message: '🚫 Demasiados intentos, espera 15 min.' });
      } else {
        loginAttempts[username] = { count: 0, time: null };
      }
    }

    // ✅ Login del admin hardcodeado
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      req.session.user = { username: ADMIN_USER, role: 'admin' };
      return res.json({ message: '✅ Login exitoso (admin)', redirect: '/panel' });
    }

    // Login usuarios normales desde MongoDB
    const user = await User.findOne({ username });
    if (!user) {
      loginAttempts[username] = loginAttempts[username] || { count: 0, time: null };
      loginAttempts[username].count++;
      loginAttempts[username].time = Date.now();
      return res.status(400).json({ message: '❌ Usuario no encontrado' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      loginAttempts[username] = loginAttempts[username] || { count: 0, time: null };
      loginAttempts[username].count++;
      loginAttempts[username].time = Date.now();
      return res.status(400).json({ message: '❌ Contraseña incorrecta' });
    }

    // Guardar sesión
    req.session.user = { username: user.username, role: user.role };
    return res.json({ message: '✅ Login exitoso', redirect: '/panel' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '⚠️ Error del servidor' });
  }
});

// Registro solo para admin (MongoDB)
router.post('/register', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'admin') {
      return res.status(403).json({ message: '🚫 No tienes permisos para registrar usuarios' });
    }

    const { newUsername, newPassword } = req.body;
    const existingUser = await User.findOne({ username: newUsername });
    if (existingUser) return res.status(400).json({ message: '⚠️ El usuario ya existe' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await User.create({ username: newUsername, password: hashed, role: 'usuario' });
    res.json({ message: `✅ Usuario '${newUsername}' creado correctamente` });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '⚠️ Error del servidor' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: '👋 Sesión cerrada correctamente', redirect: '/' });
  });
});

module.exports = router;


















// 🔐 LOGIN con bloqueo tras 3 intentos fallidos
const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const router = express.Router();

// Almacenar intentos fallidos temporalmente (en memoria)
const loginAttempts = {}; // { username: { count: 0, time: Date } }

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Verificar si el usuario está bloqueado
    if (loginAttempts[username] && loginAttempts[username].count >= 3) {
      const elapsed = Date.now() - loginAttempts[username].time;
      if (elapsed < 15 * 60 * 1000) {
        return res.status(403).json({
          message: '🚫 Has superado el número máximo de intentos. Intenta nuevamente en 15 minutos.'
        });
      } else {
        // Reiniciar intentos después de 15 minutos
        loginAttempts[username] = { count: 0, time: null };
      }
    }

    // Buscar usuario
    const user = await User.findOne({ username }).exec();
    if (!user) {
      // Aumentar intentos fallidos
      if (!loginAttempts[username]) loginAttempts[username] = { count: 0, time: null };
      loginAttempts[username].count++;
      loginAttempts[username].time = Date.now();
      return res.status(400).json({ message: '❌ Usuario no encontrado' });
    }

    // Comparar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Aumentar intentos fallidos
      if (!loginAttempts[username]) loginAttempts[username] = { count: 0, time: null };
      loginAttempts[username].count++;
      loginAttempts[username].time = Date.now();
      return res.status(400).json({ message: '❌ Contraseña incorrecta' });
    }

    // Si el login es exitoso, reiniciar intentos
    loginAttempts[username] = { count: 0, time: null };

    // Guardar sesión
    req.session.user = { username: user.username };
    return res.json({ message: '✅ Login exitoso', redirect: '/panel' });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: '⚠️ Error del servidor' });
  }
});

module.exports = router;

















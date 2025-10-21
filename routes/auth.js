const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const router = express.Router();

/**
 * Registro de usuario
 */
router.post('/register', [
  body('username').isLength({ min: 3 }).trim().escape(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send('❌ Campos inválidos');
  }

  try {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username }).exec();
    if (existingUser) {
      return res.status(400).send('❌ El usuario ya existe');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = new User({ username, password: hashedPassword });
    await user.save();

    res.send('✅ Usuario registrado correctamente');
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Error interno del servidor');
  }
});

/**
 * Login seguro
 */
router.post('/login', [
  body('username').notEmpty().trim().escape(),
  body('password').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send('❌ Campos incompletos');
  }

  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username }).exec();

    if (!user) {
      return res.status(401).send('❌ Usuario no encontrado');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send('❌ Contraseña errada');
    }

    res.send('✅ Login exitoso');
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Error interno del servidor');
  }
});

module.exports = router;
module.exports = router;






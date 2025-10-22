require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const session = require('express-session');
const authRoutes = require('./routes/auth');

const app = express();
const port = process.env.PORT || 3000;

// Conexión MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error al conectar a MongoDB:', err));

// Middlewares
app.use('/public', express.static(path.resolve(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet({ contentSecurityPolicy: { useDefaults: true, directives: { "script-src":["'self'"], "style-src":["'self'", "'unsafe-inline'"] }}}));
app.use(cors());
app.use(rateLimit({ windowMs: 15*60*1000, max: 100 }));
app.use(session({ secret: process.env.SESSION_SECRET || 'clave_temporal', resave: false, saveUninitialized: true, cookie: { secure: false } }));

// Middleware auth
function requireAuth(req, res, next) {
  if (!req.session.user) return res.redirect('/');
  next();
}

// Rutas
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>Login</title><link rel="stylesheet" href="/public/style.css"></head>
      <body>
        <h1>Inicio de sesión</h1>
        <form id="loginForm">
          <label>Usuario:</label><input type="text" id="username" required><br><br>
          <label>Contraseña:</label><input type="password" id="password" required><br><br>
          <button type="submit">Ingresar</button>
          <div class="msg"></div>
        </form>
        <script src="/public/script.js"></script>
      </body>
    </html>
  `);
});

app.get('/panel', requireAuth, (req, res) => {
  const { username, role } = req.session.user;
  const isAdmin = role === 'admin';

  res.send(`
    <html>
      <head><title>Panel</title><link rel="stylesheet" href="/public/style.css"></head>
      <body>
        <h1>Bienvenido, ${username}</h1>
        <p>Rol: ${role}</p>
        <p>Conexión exitosa ✅</p><hr>
        ${isAdmin ? `
          <h2>Registrar nuevo usuario</h2>
          <form id="registerForm">
            <label>Nuevo usuario:</label><input type="text" id="newUsername" required><br><br>
            <label>Nueva contraseña:</label><input type="password" id="newPassword" required><br><br>
            <button type="submit">Registrar</button>
            <div class="msg"></div>
          </form><hr>
        ` : `<p>No tienes permisos para registrar nuevos usuarios.</p><hr>`}
        <button id="logoutBtn">Cerrar sesión</button>
        <script src="/public/script.js"></script>
      </body>
    </html>
  `);
});

app.use('/auth', authRoutes);

app.listen(port, () => console.log(`🚀 Servidor corriendo en http://localhost:${port}`));



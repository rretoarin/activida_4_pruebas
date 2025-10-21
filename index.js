require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth');
const path = require('path');
const session = require('express-session');

const app = express();
const port = process.env.PORT || 3000;

// ✅ Ruta estática
app.use('/public', express.static(path.resolve(__dirname, 'public')));

// 🛡️ Seguridad con CSP completo
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "script-src": ["'self'"],
        "style-src": ["'self'", "'unsafe-inline'"]
      }
    }
  })
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ⚙️ Rate limiting
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// 🗄️ Sesiones simples para panel
app.use(session({
  secret: process.env.SESSION_SECRET || 'clave_temporal',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Cambiar a true si activas HTTPS
}));

// 🔐 Middleware de autenticación
function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).send('❌ Acceso no autorizado');
  }
  next();
}

// 🌐 Página de login
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Login</title>
        <link rel="stylesheet" href="/public/style.css">
      </head>
      <body>
        <h1>Inicio de sesión (MongoDB)</h1>
        <form id="loginForm">
          <label for="username">Usuario:</label>
          <input type="text" id="username" name="username" required><br><br>

          <label for="password">Contraseña:</label>
          <input type="password" id="password" name="password" required autocomplete="new-password"><br><br>

          <button type="submit">Ingresar</button>
          <div class="msg"></div>
        </form>

        <script src="/public/script.js"></script>
      </body>
    </html>
  `);
});

// 🔐 Panel protegido
app.get('/panel', requireAuth, (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Panel</title>
        <link rel="stylesheet" href="/public/style.css">
      </head>
      <body>
        <h1>Bienvenido al panel</h1>
        <p>Conexión exitosa ✅</p>
        <hr>
        <h2>Registrar nuevo usuario</h2>
        <form id="registerForm">
          <label for="newUsername">Nuevo usuario:</label>
          <input type="text" id="newUsername" required><br><br>

          <label for="newPassword">Nueva contraseña:</label>
          <input type="password" id="newPassword" required autocomplete="new-password"><br><br>

          <button type="submit">Registrar</button>
          <div class="msg"></div>
        </form>

        <script src="/public/script.js"></script>
      </body>
    </html>
  `);
});

// 🧭 Rutas de autenticación
app.use('/auth', authRoutes);

// 🗄️ Conexión a MongoDB y servidor
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Conectado a MongoDB');
    app.listen(port, () =>
      console.log(`🚀 Servidor corriendo en http://localhost:${port}`)
    );
  })
  .catch((err) => {
    console.error('❌ Error al conectar a MongoDB:', err);
  });




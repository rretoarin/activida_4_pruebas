document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  // --- LOGIN ---
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const msg = loginForm.querySelector('.msg');
      msg.textContent = '';

      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value.trim();

      try {
        const res = await fetch('/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });

        const data = await res.json();
        msg.textContent = data.message;

        if (res.ok && data.redirect) {
          window.location.href = data.redirect;
        }
      } catch (err) {
        console.error('❌ Error en login:', err);
        msg.textContent = '⚠️ Error en el servidor';
      }
    });
  }

  // --- REGISTRO ---
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const msg = registerForm.querySelector('.msg');
      msg.textContent = '';

      const newUsername = document.getElementById('newUsername').value.trim();
      const newPassword = document.getElementById('newPassword').value.trim();

      try {
        const res = await fetch('/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newUsername, newPassword })
        });

        const data = await res.json();
        msg.textContent = data.message;
      } catch (err) {
        console.error('❌ Error en registro:', err);
        msg.textContent = '⚠️ Error en el servidor';
      }
    });
  }

  // --- LOGOUT ---
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        const res = await fetch('/auth/logout', { method: 'POST' });
        const data = await res.json();
        alert(data.message);
        if (data.redirect) {
          window.location.href = data.redirect; // ✅ Regresa al login principal
        }
      } catch (err) {
        console.error('❌ Error al cerrar sesión:', err);
      }
    });
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  // --- LOGIN ---
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;

      console.log('📤 Enviando login...');

      try {
        const res = await fetch('/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });

        const data = await res.text();
        console.log('📥 Respuesta del servidor:', data);
        document.querySelector('.msg').textContent = data; // <-- cambiado

        if (res.ok) {
          window.location.href = '/panel';
        }

      } catch (err) {
        console.error('❌ Error en login:', err);
      }
    });
  }

  // --- REGISTRO ---
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const username = document.getElementById('newUsername').value;
      const password = document.getElementById('newPassword').value;

      console.log('📤 Enviando registro...');

      try {
        const res = await fetch('/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });

        const data = await res.text();
        console.log('📥 Respuesta del servidor:', data);
        document.querySelector('.msg').textContent = data; // <-- cambiado

      } catch (err) {
        console.error('❌ Error en registro:', err);
      }
    });
  }
});

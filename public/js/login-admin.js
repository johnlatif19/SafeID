/* SafeID — Admin login */
(function () {
  const form = document.getElementById('adminLoginForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true; btn.textContent = 'Verifying...';

    try {
      const data = Object.fromEntries(new FormData(form));
      const res = await window.API.post('/auth/login/admin', data, { auth: false });
      window.Auth.saveSession({ token: res.token, role: 'ADMIN', user: res.user, remember: true });
      location.href = '/dashboard-admin.html';
    } catch (err) {
      window.UI.toast(err.message || 'Invalid credentials.', 'error');
      btn.disabled = false; btn.textContent = 'Login';
    }
  });
})();
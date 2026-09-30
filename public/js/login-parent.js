/* SafeID — Parent login */
(function () {
  const form = document.getElementById('parentLoginForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true; btn.textContent = 'Logging in...';

    try {
      const data = Object.fromEntries(new FormData(form));
      const res = await window.API.post('/auth/login/parent', data, { auth: false });
      window.Auth.saveSession({ token: res.token, role: 'PARENT', user: res.user, remember: true });
      location.href = '/dashboard-parent.html';
    } catch (err) {
      window.UI.toast(err.message, 'error');
      btn.disabled = false; btn.textContent = 'Login';
    }
  });
})();
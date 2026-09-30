/* SafeID — Parent registration */
(function () {
  const form = document.getElementById('parentSignupForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!window.Validation.validate(form)) return;

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true; btn.textContent = 'Creating...';

    try {
      const data = Object.fromEntries(new FormData(form));
      const res = await window.API.post('/auth/register/parent', data, { auth: false });
      window.UI.toast('Parent account created!', 'success');
      if (res?.token) window.Auth.saveSession({ token: res.token, role: 'PARENT', user: res.user, remember: true });
      setTimeout(() => { location.href = '/dashboard-parent.html'; }, 600);
    } catch (err) {
      window.UI.toast(err.message, 'error');
      btn.disabled = false; btn.textContent = 'Create Parent Account';
    }
  });
})();
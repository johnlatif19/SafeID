/* SafeID — Patient registration */
(function () {
  const form = document.getElementById('signupForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!window.Validation.validate(form)) return;

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    const original = btn.textContent;
    btn.textContent = 'Creating account...';

    try {
      const fd = new FormData(form);
      // Remove empty photo if not chosen
      const photo = fd.get('photo');
      if (!photo || !photo.name) fd.delete('photo');

      const res = await window.API.postForm('/auth/register/patient', fd);
      window.UI.toast('Account created! Redirecting...', 'success');
      // Save session if returned
      if (res && res.token) {
        window.Auth.saveSession({ token: res.token, role: 'PATIENT', user: res.user, remember: true });
      }
      setTimeout(() => { location.href = '/index.html'; }, 600);
    } catch (err) {
      window.UI.toast(err.message || 'Registration failed.', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = original;
    }
  });
})();
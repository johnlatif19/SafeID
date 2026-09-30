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

      /* Remove empty photo field */
      const photo = fd.get('photo');
      if (!photo || !photo.name) fd.delete('photo');

      /* Send FormData — multer on backend receives it */
      const res = await window.API.postForm('/auth/register/patient', fd);

      window.UI.toast('Account created! Redirecting...', 'success');

      if (res && res.token) {
        window.Auth.saveSession({
          token: res.token,
          role: 'PATIENT',
          user: res.user,
          remember: true
        });
      }

      setTimeout(() => { location.href = '/'; }, 600);
    } catch (err) {
      window.UI.toast(err.message || 'Registration failed.', 'error');
      btn.disabled = false;
      btn.textContent = original;
    }
  });
})();

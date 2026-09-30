/* SafeID — Patient login */
(function () {
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!window.Validation.validate(form)) return;

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true; const original = btn.textContent; btn.textContent = 'Logging in...';

    try {
      const data = Object.fromEntries(new FormData(form));
      const res = await window.API.post('/auth/login/patient', {
        email: data.email, password: data.password
      }, { auth: false });

      window.Auth.saveSession({ token: res.token, role: 'PATIENT', user: res.user, remember: !!data.remember });
      window.UI.toast('Welcome back!', 'success');
      setTimeout(() => { location.href = '/index.html'; }, 500);
    } catch (err) {
      window.UI.toast(err.message || 'Login failed.', 'error');
      btn.disabled = false; btn.textContent = original;
    }
  });

  // Forgot password (UI only)
  const forgot = document.getElementById('forgotLink');
  if (forgot) forgot.addEventListener('click', (e) => {
    e.preventDefault();
    window.UI.toast('Please contact support to reset your password.', 'info');
  });
})();
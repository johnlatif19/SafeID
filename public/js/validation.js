/* SafeID — Form validation */
(function () {
  const rules = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^[+\d][\d\s\-()]{6,}$/
  };

  function markError(input, message) {
    input.classList.add('error');
    let err = input.parentElement.querySelector('.error-text');
    if (!err) {
      err = document.createElement('span');
      err.className = 'error-text';
      input.parentElement.appendChild(err);
    }
    err.textContent = message;
  }
  function clearError(input) {
    input.classList.remove('error');
    const err = input.parentElement.querySelector('.error-text');
    if (err) err.remove();
  }
  function clearAll(form) {
    form.querySelectorAll('input, select, textarea').forEach(clearError);
  }

  function validate(form) {
    clearAll(form);
    let ok = true;
    const fields = form.querySelectorAll('input, select, textarea');

    fields.forEach((f) => {
      const val = (f.value || '').trim();
      if (f.required && !val) { markError(f, 'This field is required'); ok = false; return; }
      if (f.type === 'email' && val && !rules.email.test(val)) { markError(f, 'Invalid email address'); ok = false; }
      if (f.type === 'tel' && val && !rules.phone.test(val)) { markError(f, 'Invalid phone number'); ok = false; }
      if (f.name === 'password' && val && val.length < 8) { markError(f, 'Password must be at least 8 characters'); ok = false; }
    });

    return ok;
  }

  window.Validation = { validate, markError, clearError, clearAll };
})();
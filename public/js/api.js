/* SafeID — Fetch wrapper */
(function () {
  const BASE = window.SAFEID_CONFIG.API_BASE;

  function getToken() {
    return localStorage.getItem(window.SAFEID_CONFIG.TOKEN_KEY);
  }

  async function request(path, { method = 'GET', body, isForm = false, auth = true } = {}) {
    const headers = {};
    if (!isForm) headers['Content-Type'] = 'application/json';
    if (auth && getToken()) headers['Authorization'] = `Bearer ${getToken()}`;

    const opts = { method, headers };
    if (body) opts.body = isForm ? body : JSON.stringify(body);

    let res;
    try {
      res = await fetch(`${BASE}${path}`, opts);
    } catch (err) {
      throw { status: 0, message: 'Network error. Please check your connection.' };
    }

    let data = null;
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) data = await res.json().catch(() => null);

    if (!res.ok) {
      throw {
        status: res.status,
        message: (data && data.message) || defaultMessage(res.status)
      };
    }
    return data;
  }

  function defaultMessage(status) {
    switch (status) {
      case 400: return 'Invalid request.';
      case 401: return 'Unauthorized. Please log in.';
      case 403: return 'Access denied.';
      case 404: return 'Not found.';
      case 429: return 'Too many attempts. Try again later.';
      case 500: return 'Server error. Please try again.';
      default:  return 'Something went wrong.';
    }
  }

  window.API = {
    get:    (p, o) => request(p, { ...o, method: 'GET' }),
    post:   (p, b, o) => request(p, { ...o, method: 'POST', body: b }),
    put:    (p, b, o) => request(p, { ...o, method: 'PUT', body: b }),
    patch:  (p, b, o) => request(p, { ...o, method: 'PATCH', body: b }),
    del:    (p, o) => request(p, { ...o, method: 'DELETE' }),
    postForm: (p, formData) => request(p, { method: 'POST', body: formData, isForm: true })
  };
})();
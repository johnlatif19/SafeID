/* SafeID — Fetch wrapper */
(function () {
  const BASE = window.SAFEID_CONFIG.API_BASE;

  /* ------------------------------------------------------------------ */
  /*  TOKEN LOOKUP — reads from localStorage OR sessionStorage          */
  /* ------------------------------------------------------------------ */
  function getToken() {
    return localStorage.getItem(window.SAFEID_CONFIG.TOKEN_KEY)
        || sessionStorage.getItem(window.SAFEID_CONFIG.TOKEN_KEY);
  }

  /* ------------------------------------------------------------------ */
  /*  MAIN REQUEST FUNCTION                                             */
  /* ------------------------------------------------------------------ */
  async function request(path, {
    method = 'GET',
    body,
    isForm = false,
    auth = true
  } = {}) {
    const headers = {};

    /* Content-Type — skip for FormData (browser sets it with boundary) */
    if (!isForm) {
      headers['Content-Type'] = 'application/json';
    }

    /* Authorization — add bearer token if we have one and auth is needed */
    if (auth) {
      const token = getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const opts = {
      method,
      headers,
      credentials: 'same-origin'
    };

    if (body) {
      opts.body = isForm ? body : JSON.stringify(body);
    }

    /* ---------- Perform the fetch ---------- */
    let res;
    try {
      res = await fetch(`${BASE}${path}`, opts);
    } catch (err) {
      throw { status: 0, message: 'Network error. Please check your connection.' };
    }

    /* ---------- Parse the response ---------- */
    let data = null;
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      data = await res.json().catch(() => null);
    }

    /* ---------- Handle non-2xx responses ---------- */
    if (!res.ok) {
      /* Auto-logout on 401 (expired/invalid token) — but only if we had one */
      if (res.status === 401 && getToken()) {
        /* Don't redirect here — let the caller handle it */
        console.warn('401 Unauthorized — token may be expired');
      }

      throw {
        status: res.status,
        message: (data && data.message) || defaultMessage(res.status)
      };
    }

    return data;
  }

  /* ------------------------------------------------------------------ */
  /*  DEFAULT ERROR MESSAGES                                            */
  /* ------------------------------------------------------------------ */
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

  /* ------------------------------------------------------------------ */
  /*  PUBLIC API                                                        */
  /* ------------------------------------------------------------------ */
  window.API = {
    get:      (p, o)   => request(p, { ...o, method: 'GET' }),
    post:     (p, b, o) => request(p, { ...o, method: 'POST',  body: b }),
    put:      (p, b, o) => request(p, { ...o, method: 'PUT',   body: b }),
    patch:    (p, b, o) => request(p, { ...o, method: 'PATCH', body: b }),
    del:      (p, o)   => request(p, { ...o, method: 'DELETE' }),
    postForm: (p, formData) => request(p, { method: 'POST', body: formData, isForm: true })
  };
})();

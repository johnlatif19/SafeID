/* SafeID — Client-side auth session management */
(function () {
  const C = window.SAFEID_CONFIG;

  function saveSession({ token, role, user, remember }) {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(C.TOKEN_KEY, token);
    storage.setItem(C.ROLE_KEY, role);
    storage.setItem(C.USER_KEY, JSON.stringify(user || {}));
    if (!remember) {
      localStorage.removeItem(C.TOKEN_KEY);
      localStorage.removeItem(C.ROLE_KEY);
      localStorage.removeItem(C.USER_KEY);
    }
  }

  function getToken() {
    return localStorage.getItem(C.TOKEN_KEY) || sessionStorage.getItem(C.TOKEN_KEY);
  }
  function getRole() {
    return localStorage.getItem(C.ROLE_KEY) || sessionStorage.getItem(C.ROLE_KEY);
  }
  function getUser() {
    try {
      return JSON.parse(localStorage.getItem(C.USER_KEY) || sessionStorage.getItem(C.USER_KEY) || '{}');
    } catch { return {}; }
  }

  function clearSession() {
    [localStorage, sessionStorage].forEach((s) => {
      s.removeItem(C.TOKEN_KEY);
      s.removeItem(C.ROLE_KEY);
      s.removeItem(C.USER_KEY);
    });
  }

  function logout(redirect = '/login') {
    clearSession();
    location.href = redirect;
  }

  /** Guard: ensures a valid session + role, else redirect */
  function requireRole(role, redirect = '/login') {
    const token = getToken();
    const r = getRole();
    if (!token || (role && r !== role)) {
      clearSession();
      location.href = redirect;
      return false;
    }
    return true;
  }

  window.Auth = { saveSession, getToken, getRole, getUser, clearSession, logout, requireRole };
})();

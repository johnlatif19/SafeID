/* SafeID — Client-side auth session management */
(function () {
  const C = window.SAFEID_CONFIG;

  /* ------------------------------------------------------------------ */
  /*  SAVE SESSION                                                      */
  /*  - remember=true  → localStorage  (persists across browser restarts)*/
  /*  - remember=false → sessionStorage (cleared when tab closes)        */
  /*  We ALSO mirror to the other storage when needed so token lookup   */
  /*  always succeeds regardless of which storage holds the session.    */
  /* ------------------------------------------------------------------ */
  function saveSession({ token, role, user, remember }) {
    const primary = remember ? localStorage : sessionStorage;
    const secondary = remember ? sessionStorage : localStorage;

    /* Clear both storages first to avoid stale data */
    clearSession();

    primary.setItem(C.TOKEN_KEY, token);
    primary.setItem(C.ROLE_KEY, role);
    primary.setItem(C.USER_KEY, JSON.stringify(user || {}));

    /* Also keep the remember flag for reference */
    primary.setItem('safeid_remember', remember ? '1' : '0');

    /* No need to write to secondary */
  }

  /* ------------------------------------------------------------------ */
  /*  GET TOKEN / ROLE / USER — read from EITHER storage                */
  /* ------------------------------------------------------------------ */
  function getToken() {
    return localStorage.getItem(C.TOKEN_KEY)
        || sessionStorage.getItem(C.TOKEN_KEY);
  }

  function getRole() {
    return localStorage.getItem(C.ROLE_KEY)
        || sessionStorage.getItem(C.ROLE_KEY);
  }

  function getUser() {
    try {
      const raw = localStorage.getItem(C.USER_KEY)
               || sessionStorage.getItem(C.USER_KEY)
               || '{}';
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }

  /* ------------------------------------------------------------------ */
  /*  CLEAR SESSION — wipes both storages                               */
  /* ------------------------------------------------------------------ */
  function clearSession() {
    [localStorage, sessionStorage].forEach((s) => {
      s.removeItem(C.TOKEN_KEY);
      s.removeItem(C.ROLE_KEY);
      s.removeItem(C.USER_KEY);
      s.removeItem('safeid_remember');
    });
  }

  /* ------------------------------------------------------------------ */
  /*  LOGOUT                                                            */
  /* ------------------------------------------------------------------ */
  function logout(redirect = '/login') {
    clearSession();
    location.href = redirect;
  }

  /* ------------------------------------------------------------------ */
  /*  REQUIRE ROLE — guards protected pages                             */
  /*  Returns false and redirects if the user isn't authenticated with  */
  /*  the expected role.                                                */
  /* ------------------------------------------------------------------ */
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

  /* ------------------------------------------------------------------ */
  /*  IS LOGGED IN — helper                                             */
  /* ------------------------------------------------------------------ */
  function isLoggedIn() {
    return !!getToken();
  }

  /* ------------------------------------------------------------------ */
  /*  EXPORTS                                                           */
  /* ------------------------------------------------------------------ */
  window.Auth = {
    saveSession,
    getToken,
    getRole,
    getUser,
    clearSession,
    logout,
    requireRole,
    isLoggedIn
  };
})();

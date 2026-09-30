/* SafeID — Global client config */
window.SAFEID_CONFIG = {
  API_BASE: '/api',
  EMERGENCY_BASE: '/emergency',
  EMERGENCY_SERVICES_NUMBER: '123',
  TOKEN_KEY: 'safeid_token',
  ROLE_KEY: 'safeid_role',
  USER_KEY: 'safeid_user'
};

/* Simple helper for query params */
window.SAFEID_CONFIG.qs = (key) => new URLSearchParams(location.search).get(key);
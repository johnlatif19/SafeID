/* SafeID — Shared UI helpers (toast, modal, navbar, loader) */
(function () {
  /* ---------- Toast ---------- */
  function toast(message, type = 'info', timeout = 3200) {
    const root = document.getElementById('toastRoot');
    if (!root) return alert(message);

    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = message;
    root.appendChild(el);

    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(20px)';
      el.style.transition = 'all .25s';
      setTimeout(() => el.remove(), 300);
    }, timeout);
  }

  /* ---------- Modal ---------- */
  function openModal(html) {
    const root = document.getElementById('modalRoot');
    if (!root) return;

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = `<div class="modal">${html}</div>`;
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) closeModal(); });
    root.appendChild(backdrop);
    return backdrop;
  }
  function closeModal() {
    const root = document.getElementById('modalRoot');
    if (root) root.innerHTML = '';
  }

  /* ---------- Loader ---------- */
  function hideLoader() {
    const l = document.getElementById('loader') || document.getElementById('emergencyLoader') || document.getElementById('app-loading');
    if (l) { l.classList.add('hide'); setTimeout(() => l.remove(), 350); }
  }
  function showLoader() {
    const l = document.createElement('div');
    l.className = 'loader-screen';
    l.id = 'loader';
    l.innerHTML = `<img src="/assets/safeid-logo.png" alt="SafeID" /><div class="spinner"></div>`;
    document.body.appendChild(l);
  }

  /* ---------- Navbar (patient) ---------- */
  function renderNavbar() {
    const el = document.getElementById('navbar');
    if (!el) return;
    el.className = 'navbar';
    el.innerHTML = `
      <a class="brand" href="/index.html">
        <img src="/assets/safeid-logo.png" alt="SafeID" />
        <span>SafeID</span>
      </a>
      <nav class="nav-links">
        <a href="/index.html">Home</a>
        <a href="/index.html#qr">My QR</a>
        <a href="/index.html#profile">Profile</a>
        <a href="#" id="navLogout">Logout</a>
      </nav>`;
    document.getElementById('navLogout').addEventListener('click', (e) => {
      e.preventDefault();
      window.Auth.logout('/login-site.html');
    });
  }

  /* ---------- Sidebars ---------- */
  function renderParentSidebar(active = 'overview') {
    const el = document.getElementById('parentSidebar');
    if (!el) return;
    const links = [
      ['overview', '📊 Overview'],
      ['children', '👨‍👩‍👧 My Children'],
      ['qr', '🔳 QR Codes'],
      ['profile', '⚙️ Profile'],
      ['logout', '🚪 Logout']
    ];
    el.innerHTML = `
      <div class="side-brand">
        <img src="/assets/safeid-logo.png" alt="SafeID" /><span>SafeID</span>
      </div>
      ${links.map(([key, label]) => `
        <button class="side-link ${key === active ? 'active' : ''} ${key === 'logout' ? 'danger' : ''}" data-section="${key}">${label}</button>
      `).join('')}
    `;
    el.querySelectorAll('[data-section]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const s = btn.dataset.section;
        if (s === 'logout') return window.Auth.logout('/login-parent.html');
        document.querySelectorAll('.dash-section').forEach((x) => x.classList.remove('active'));
        document.getElementById(`section-${s}`)?.classList.add('active');
        el.querySelectorAll('.side-link').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('parentSidebar').classList.remove('open');
      });
    });
  }

  function renderAdminSidebar(active = 'dashboard') {
    const el = document.getElementById('adminSidebar');
    if (!el) return;
    const links = [
      ['dashboard', '📊 Dashboard'],
      ['patients', '👥 Patients'],
      ['parents', '👨‍👩‍👧 Parents'],
      ['emergencies', '🚨 Emergencies'],
      ['qr', '🔳 QR Management'],
      ['reports', '📈 Reports'],
      ['settings', '⚙️ Settings'],
      ['logout', '🚪 Logout']
    ];
    el.innerHTML = `
      <div class="side-brand">
        <img src="/assets/safeid-logo.png" alt="SafeID" /><span>SafeID Admin</span>
      </div>
      ${links.map(([key, label]) => `
        <button class="side-link ${key === active ? 'active' : ''} ${key === 'logout' ? 'danger' : ''}" data-section="${key}">${label}</button>
      `).join('')}
    `;
    el.querySelectorAll('[data-section]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const s = btn.dataset.section;
        if (s === 'logout') return window.Auth.logout('/login-admin.html');
        document.querySelectorAll('.dash-section').forEach((x) => x.classList.remove('active'));
        document.getElementById(`section-${s}`)?.classList.add('active');
        document.getElementById('adminPageTitle').textContent = btn.textContent.trim().replace(/^\S+\s/, '');
        el.querySelectorAll('.side-link').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        el.classList.remove('open');
      });
    });
  }

  /* ---------- Hamburger toggle ---------- */
  function bindSidebarToggle() {
    const btn = document.getElementById('sidebarToggle');
    const side = document.querySelector('.sidebar');
    if (btn && side) btn.addEventListener('click', () => side.classList.toggle('open'));
  }

  /* ---------- Utils ---------- */
  function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }
  function formatDate(d) {
    if (!d) return '—';
    const dt = new Date(d);
    return isNaN(dt) ? '—' : dt.toLocaleDateString();
  }

  window.UI = { toast, openModal, closeModal, hideLoader, showLoader, renderNavbar, renderParentSidebar, renderAdminSidebar, bindSidebarToggle, escapeHtml, formatDate };
})();
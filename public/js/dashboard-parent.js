/* SafeID — Parent dashboard */
(function () {
  if (!window.Auth.requireRole('PARENT', '/login-parent.html')) return;

  window.UI.renderParentSidebar('overview');
  window.UI.bindSidebarToggle();

  const $ = (id) => document.getElementById(id);

  async function loadOverview() {
    try {
      const s = await window.API.get('/parent/stats');
      $('statChildren').textContent = s.children || 0;
      $('statNotifications').textContent = s.notifications || 0;
      $('statScans').textContent = s.scans || 0;
    } catch {}
  }

  async function loadNotifications() {
    try {
      const list = await window.API.get('/parent/notifications');
      const ul = $('notificationsList');
      if (!list.length) { ul.innerHTML = '<li class="muted">No notifications yet.</li>'; return; }
      ul.innerHTML = list.map((n) => `<li><strong>${window.UI.escapeHtml(n.title)}</strong><br><span class="muted">${window.UI.formatDate(n.createdAt)} — ${window.UI.escapeHtml(n.message)}</span></li>`).join('');
    } catch {}
  }

  async function loadChildren() {
    try {
      const children = await window.API.get('/parent/children');
      const grid = $('childrenGrid');
      if (!children.length) { grid.innerHTML = '<p class="muted">No children linked yet.</p>'; return; }
      grid.innerHTML = children.map((c) => `
        <div class="child-card">
          <img src="${c.photo || '/assets/placeholder-avatar.png'}" alt="${window.UI.escapeHtml(c.fullName)}" />
          <h4>${window.UI.escapeHtml(c.fullName)}</h4>
          <p class="child-meta">SafeID: ${window.UI.escapeHtml(c.safeid)}</p>
          <p class="child-meta">Age: ${c.age ?? '—'} · Blood: ${window.UI.escapeHtml(c.bloodType || '—')}</p>
          <span class="badge badge-success">${window.UI.escapeHtml(c.status || 'Active')}</span>
        </div>`).join('');
    } catch {}
  }

  async function loadQrList() {
    try {
      const children = await window.API.get('/parent/children');
      const list = $('qrList');
      if (!children.length) { list.innerHTML = '<p class="muted">No QR codes yet.</p>'; return; }
      list.innerHTML = children.map((c) => `
        <div class="qr-item">
          <img src="${c.qrImage || ''}" alt="QR" />
          <p><strong>${window.UI.escapeHtml(c.fullName)}</strong></p>
          <button class="btn btn-sm btn-secondary" data-download="${c.qrImage || ''}" data-name="${window.UI.escapeHtml(c.fullName)}">⬇ Download</button>
        </div>`).join('');
      list.querySelectorAll('[data-download]').forEach((b) => {
        b.addEventListener('click', () => {
          if (b.dataset.download) window.QR.download(b.dataset.download, `${b.dataset.name}-qr.png`);
        });
      });
    } catch {}
  }

  loadOverview();
  loadNotifications();
  loadChildren();
  loadQrList();
})();
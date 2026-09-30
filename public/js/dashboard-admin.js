/* SafeID — Admin dashboard */
(function () {
  if (!window.Auth.requireRole('ADMIN', '/login-admin.html')) return;

  window.UI.renderAdminSidebar('dashboard');
  window.UI.bindSidebarToggle();

  const $ = (id) => document.getElementById(id);

  async function loadStats() {
    try {
      const s = await window.API.get('/admin/stats');
      $('statPatients').textContent = s.patients || 0;
      $('statParents').textContent = s.parents || 0;
      $('statActive').textContent = s.activeIds || 0;
      $('statScans').textContent = s.scans || 0;
    } catch {}
  }

  async function loadRecentEmergencies() {
    try {
      const list = await window.API.get('/admin/emergencies/recent');
      $('recentEmergencies').innerHTML = list.map((e) => `
        <tr>
          <td>${window.UI.escapeHtml(e.id)}</td>
          <td>${window.UI.escapeHtml(e.patientName)}</td>
          <td>${window.UI.formatDate(e.createdAt)}</td>
          <td><span class="status-dot ${e.status === 'resolved' ? 'active' : 'disabled'}">${e.status}</span></td>
        </tr>`).join('') || `<tr><td colspan="4" class="muted">No recent emergencies.</td></tr>`;
    } catch {}
  }

  async function loadPatients(search = '') {
    try {
      const list = await window.API.get(`/admin/patients?search=${encodeURIComponent(search)}`);
      $('patientsTable').innerHTML = list.map((p) => `
        <tr>
          <td>${window.UI.escapeHtml(p.fullName)}</td>
          <td>${window.UI.escapeHtml(p.safeid)}</td>
          <td>${window.UI.escapeHtml(p.email)}</td>
          <td>${window.UI.escapeHtml(p.phone || '—')}</td>
          <td><span class="status-dot ${p.status === 'active' ? 'active' : 'disabled'}">${p.status}</span></td>
          <td>${window.UI.formatDate(p.createdAt)}</td>
          <td class="actions">
            <button class="btn btn-sm btn-outline" data-act="view" data-id="${p._id}">View</button>
            <button class="btn btn-sm ${p.status === 'active' ? 'btn-secondary' : 'btn-primary'}" data-act="toggle" data-id="${p._id}">${p.status === 'active' ? 'Disable' : 'Enable'}</button>
          </td>
        </tr>`).join('') || `<tr><td colspan="7" class="muted">No patients found.</td></tr>`;

      $('patientsTable').querySelectorAll('[data-act]').forEach((b) => {
        b.addEventListener('click', () => handlePatientAction(b.dataset.act, b.dataset.id));
      });
    } catch {}
  }

  async function handlePatientAction(act, id) {
    try {
      if (act === 'toggle') {
        await window.API.patch(`/admin/patients/${id}/toggle`);
        window.UI.toast('Status updated', 'success');
        loadPatients($('patientSearch').value);
      } else if (act === 'view') {
        const p = await window.API.get(`/admin/patients/${id}`);
        window.UI.openModal(`
          <h2>${window.UI.escapeHtml(p.fullName)}</h2>
          <dl class="info-list">
            <dt>SafeID</dt><dd>${p.safeid}</dd>
            <dt>Email</dt><dd>${p.email}</dd>
            <dt>Phone</dt><dd>${p.phone || '—'}</dd>
            <dt>Blood Type</dt><dd>${p.bloodType || '—'}</dd>
          </dl>
          <div class="modal-actions"><button class="btn btn-outline" onclick="UI.closeModal()">Close</button></div>
        `);
      }
    } catch (err) { window.UI.toast(err.message, 'error'); }
  }

  async function loadParents(search = '') {
    try {
      const list = await window.API.get(`/admin/parents?search=${encodeURIComponent(search)}`);
      $('parentsTable').innerHTML = list.map((p) => `
        <tr>
          <td>${window.UI.escapeHtml(p.fullName)}</td>
          <td>${window.UI.escapeHtml(p.email)}</td>
          <td>${window.UI.escapeHtml(p.phone || '—')}</td>
          <td>${p.childrenCount ?? 0}</td>
          <td><span class="status-dot ${p.status === 'active' ? 'active' : 'disabled'}">${p.status}</span></td>
          <td class="actions">
            <button class="btn btn-sm ${p.status === 'active' ? 'btn-secondary' : 'btn-primary'}" data-act="toggle" data-id="${p._id}">${p.status === 'active' ? 'Disable' : 'Enable'}</button>
          </td>
        </tr>`).join('') || `<tr><td colspan="6" class="muted">No parents found.</td></tr>`;
      $('parentsTable').querySelectorAll('[data-act="toggle"]').forEach((b) => {
        b.addEventListener('click', async () => {
          await window.API.patch(`/admin/parents/${b.dataset.id}/toggle`);
          loadParents($('parentSearch').value);
        });
      });
    } catch {}
  }

  async function loadEmergencies() {
    const date = $('emergencyFilterDate').value;
    const status = $('emergencyFilterStatus').value;
    try {
      const q = new URLSearchParams();
      if (date) q.set('date', date);
      if (status) q.set('status', status);
      const list = await window.API.get(`/admin/emergencies?${q}`);
      $('emergenciesTable').innerHTML = list.map((e) => `
        <tr>
          <td>${e.id}</td>
          <td>${window.UI.escapeHtml(e.patientName)}</td>
          <td>${window.UI.formatDate(e.createdAt)}</td>
          <td>${new Date(e.createdAt).toLocaleTimeString()}</td>
          <td><span class="status-dot ${e.status === 'resolved' ? 'active' : 'disabled'}">${e.status}</span></td>
        </tr>`).join('') || `<tr><td colspan="5" class="muted">No emergencies found.</td></tr>`;
    } catch {}
  }

  async function loadQr() {
    const search = $('qrSearch').value;
    try {
      const list = await window.API.get(`/admin/qr?search=${encodeURIComponent(search)}`);
      $('qrTable').innerHTML = list.map((q) => `
        <tr>
          <td>${q.safeid}</td>
          <td>${window.UI.escapeHtml(q.ownerName)}</td>
          <td><span class="status-dot ${q.active ? 'active' : 'disabled'}">${q.active ? 'Active' : 'Disabled'}</span></td>
          <td class="actions">
            <button class="btn btn-sm btn-outline" data-act="regen" data-id="${q._id}">Regenerate</button>
            <button class="btn btn-sm btn-secondary" data-act="toggle" data-id="${q._id}">${q.active ? 'Disable' : 'Enable'}</button>
          </td>
        </tr>`).join('') || `<tr><td colspan="4" class="muted">No QR codes.</td></tr>`;
      $('qrTable').querySelectorAll('[data-act]').forEach((b) => {
        b.addEventListener('click', async () => {
          const act = b.dataset.act;
          if (act === 'regen') {
            await window.API.post(`/admin/qr/${b.dataset.id}/regenerate`);
          } else {
            await window.API.patch(`/admin/qr/${b.dataset.id}/toggle`);
          }
          window.UI.toast('Done', 'success');
          loadQr();
        });
      });
    } catch {}
  }

  /* Events */
  $('patientSearch')?.addEventListener('input', (e) => loadPatients(e.target.value));
  $('parentSearch')?.addEventListener('input', (e) => loadParents(e.target.value));
  $('qrSearch')?.addEventListener('input', () => loadQr());
  $('emergencyFilterDate')?.addEventListener('change', loadEmergencies);
  $('emergencyFilterStatus')?.addEventListener('change', loadEmergencies);

  /* Init */
  loadStats();
  loadRecentEmergencies();
  loadPatients();
  loadParents();
  loadEmergencies();
  loadQr();
})();
/* SafeID — Patient profile page */
(function () {
  if (!window.Auth.requireRole('PATIENT', '/login-site.html')) return;

  const $ = (id) => document.getElementById(id);

  function fill(data) {
    $('profileName').textContent  = data.fullName || '—';
    $('safeidNumber').textContent = data.safeid   || '—';
    $('bloodTypeBadge').textContent = data.bloodType || '—';
    $('bloodType').textContent    = data.bloodType || '—';
    $('dob').textContent          = window.UI.formatDate(data.dob);
    $('gender').textContent       = data.gender || '—';
    $('phone').textContent        = data.phone || '—';
    $('email').textContent        = data.email || '—';
    $('address').textContent      = data.address || '—';
    $('ecName').textContent       = data.ecName || '—';
    $('ecPhone').textContent      = data.ecPhone || '—';
    $('allergies').textContent    = data.allergies || 'None';
    $('conditions').textContent   = data.conditions || 'None';
    $('medications').textContent  = data.medications || 'None';
    if (data.photo) $('profilePhoto').src = data.photo;
    if (data.qrImage) $('qrImage').src = data.qrImage;
    if (data.emergencyUrl) {
      $('qrLink').textContent = data.emergencyUrl;
    }
  }

  async function load() {
    try {
      const data = await window.API.get('/patient/profile');
      fill(data);
    } catch (err) {
      window.UI.toast(err.message, 'error');
    } finally {
      window.UI.hideLoader();
    }
  }

  /* Buttons */
  $('emergencyBtn')?.addEventListener('click', () => {
    const url = $('qrLink').textContent;
    if (url) window.open(url, '_blank');
  });
  $('downloadQrBtn')?.addEventListener('click', () => {
    const src = $('qrImage').src;
    if (src) window.QR.download(src, 'safeid-qr.png');
  });
  $('printQrBtn')?.addEventListener('click', () => {
    const src = $('qrImage').src;
    if (src) window.QR.print(src, $('profileName').textContent);
  });
  $('copyLinkBtn')?.addEventListener('click', async () => {
    const link = $('qrLink').textContent;
    if (!link) return;
    const ok = await window.QR.copy(link);
    window.UI.toast(ok ? 'Link copied' : 'Copy failed', ok ? 'success' : 'error');
  });

  /* Edit profile */
  $('editProfileBtn')?.addEventListener('click', async () => {
    const data = await window.API.get('/patient/profile').catch(() => null);
    if (!data) return;
    const html = `
      <h2>Edit Profile</h2>
      <form id="editProfileForm">
        <label>Full Name<input name="fullName" value="${window.UI.escapeHtml(data.fullName)}" /></label>
        <div class="form-row">
          <label>Phone<input name="phone" value="${window.UI.escapeHtml(data.phone)}" /></label>
          <label>Blood Type<input name="bloodType" value="${window.UI.escapeHtml(data.bloodType)}" /></label>
        </div>
        <label>Allergies<input name="allergies" value="${window.UI.escapeHtml(data.allergies)}" /></label>
        <label>Conditions<input name="conditions" value="${window.UI.escapeHtml(data.conditions)}" /></label>
        <label>Medications<input name="medications" value="${window.UI.escapeHtml(data.medications)}" /></label>
        <label>Address<input name="address" value="${window.UI.escapeHtml(data.address)}" /></label>
        <label>Emergency Contact Name<input name="ecName" value="${window.UI.escapeHtml(data.ecName)}" /></label>
        <label>Emergency Contact Phone<input name="ecPhone" value="${window.UI.escapeHtml(data.ecPhone)}" /></label>
        <div class="modal-actions">
          <button type="button" class="btn btn-outline" id="cancelEdit">Cancel</button>
          <button type="submit" class="btn btn-primary">Save</button>
        </div>
      </form>`;
    const backdrop = window.UI.openModal(html);
    backdrop.querySelector('#cancelEdit').onclick = window.UI.closeModal;
    backdrop.querySelector('#editProfileForm').onsubmit = async (e) => {
      e.preventDefault();
      const body = Object.fromEntries(new FormData(e.target));
      try {
        const updated = await window.API.put('/patient/profile', body);
        window.UI.toast('Profile updated', 'success');
        window.UI.closeModal();
        fill({ ...data, ...updated });
      } catch (err) {
        window.UI.toast(err.message, 'error');
      }
    };
  });

  window.UI.renderNavbar();
  load();
})();
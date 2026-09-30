/* SafeID — Public emergency page */
(function () {
  const $ = (id) => document.getElementById(id);

  function notFound() {
    $('emergencyLoader')?.classList.add('hidden');
    $('emergencyContent')?.classList.add('hidden');
    $('emergencyNotFound')?.classList.remove('hidden');
  }

  function fill(data) {
    $('emgName').textContent = data.fullName || '—';
    $('emgSafeId').textContent = data.safeid || '—';
    $('emgBlood').textContent = data.bloodType || '—';
    $('emgAllergies').textContent = data.allergies || 'None reported';
    $('emgConditions').textContent = data.conditions || 'None reported';
    $('emgMedications').textContent = data.medications || '—';
    $('emgEcName').textContent = data.ecName || '—';
    $('emgEcPhone').textContent = data.ecPhone || '—';
    $('emgNotes').textContent = data.notes || '—';

    if (!data.medications) $('emgMedicationsWrap').classList.add('hidden');
    if (!data.notes) $('emgNotesWrap').classList.add('hidden');
    if (data.photo) $('emgPhoto').src = data.photo;

    const contactTel = data.ecPhone ? `tel:${data.ecPhone.replace(/\s/g, '')}` : '#';
    $('callContactBtn').href = contactTel;
    $('callServicesBtn').href = `tel:${window.SAFEID_CONFIG.EMERGENCY_SERVICES_NUMBER}`;

    $('shareLocationBtn').onclick = () => {
      if (!navigator.geolocation) return window.UI.toast('Geolocation not supported', 'error');
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        const url = `https://maps.google.com/?q=${latitude},${longitude}`;
        const text = `Emergency location: ${url}`;
        if (navigator.share) navigator.share({ title: 'SafeID Location', text, url }).catch(() => {});
        else { navigator.clipboard.writeText(text); window.UI.toast('Location link copied', 'success'); }
      }, () => window.UI.toast('Unable to fetch location', 'error'));
    };
  }

  async function load() {
    const token = location.pathname.split('/').pop();
    try {
      const data = await window.API.get(`/emergency/${encodeURIComponent(token)}`, { auth: false });
      if (!data || !data.fullName) return notFound();
      fill(data);
      $('emergencyLoader').classList.add('hidden');
      $('emergencyContent').classList.remove('hidden');
    } catch {
      notFound();
    }
  }

  load();
})();
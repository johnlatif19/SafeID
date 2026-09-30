/* SafeID — صفحة الطوارئ العامة (تُفتح عند مسح رمز QR) */
(function () {
  const $ = (id) => document.getElementById(id);

  /* ---------------------------------------------------------------- */
  /*  حالة عدم العثور على الملف                                       */
  /* ---------------------------------------------------------------- */
  function showNotFound() {
    const loader = $('emergencyLoader');
    const content = $('emergencyContent');
    const notFound = $('emergencyNotFound');

    if (loader) loader.classList.add('hidden');
    if (content) content.classList.add('hidden');
    if (notFound) notFound.classList.remove('hidden');
  }

  /* ---------------------------------------------------------------- */
  /*  ملء البيانات في الصفحة                                          */
  /* ---------------------------------------------------------------- */
  function fillProfile(data) {
    /* الاسم + رقم SafeID */
    $('emgName').textContent = data.fullName || '—';
    $('emgSafeId').textContent = data.safeid || '—';

    /* فصيلة الدم — العنصر الأهم */
    $('emgBlood').textContent = data.bloodType || '—';

    /* الحساسية */
    $('emgAllergies').textContent = data.allergies || 'لا يوجد';

    /* الحالات المرضية */
    $('emgConditions').textContent = data.conditions || 'لا يوجد';

    /* الأدوية — تظهر فقط لو موجودة */
    if (data.medications) {
      $('emgMedications').textContent = data.medications;
    } else {
      $('emgMedicationsWrap').classList.add('hidden');
    }

    /* جهة الاتصال في الطوارئ */
    $('emgEcName').textContent = data.ecName || '—';
    $('emgEcPhone').textContent = data.ecPhone || '—';

    /* الملاحظات الهامة */
    if (data.notes) {
      $('emgNotes').textContent = data.notes;
    } else {
      $('emgNotesWrap').classList.add('hidden');
    }

    /* الصورة الشخصية */
    if (data.photo) {
      $('emgPhoto').src = data.photo;
    }

    /* زر الاتصال بجهة الطوارئ */
    const contactBtn = $('callContactBtn');
    if (data.ecPhone) {
      const cleanPhone = data.ecPhone.replace(/[^\d+]/g, '');
      contactBtn.href = `tel:${cleanPhone}`;
    } else {
      contactBtn.style.display = 'none';
    }

    /* زر الاتصال بخدمات الطوارئ */
    const servicesNumber = window.SAFEID_CONFIG?.EMERGENCY_SERVICES_NUMBER || '123';
    $('callServicesBtn').href = `tel:${servicesNumber}`;

    /* زر مشاركة الموقع */
    $('shareLocationBtn').addEventListener('click', shareLocation);
  }

  /* ---------------------------------------------------------------- */
  /*  مشاركة الموقع                                                   */
  /* ---------------------------------------------------------------- */
  function shareLocation() {
    if (!navigator.geolocation) {
      window.UI.toast('خدمة تحديد الموقع غير مدعومة على هذا الجهاز', 'error');
      return;
    }

    const btn = $('shareLocationBtn');
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = '📍 جارٍ تحديد الموقع...';

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const mapUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
        const text = `موقع الطوارئ: ${mapUrl}`;

        /* Web Share API لو متاح */
        if (navigator.share) {
          navigator.share({
            title: 'موقع الطوارئ — SafeID',
            text,
            url: mapUrl
          }).catch(() => {});
        } else {
          /* Fallback: نسخ الرابط */
          navigator.clipboard.writeText(text)
            .then(() => window.UI.toast('تم نسخ رابط الموقع', 'success'))
            .catch(() => window.UI.toast('تعذر نسخ الرابط', 'error'));
        }

        btn.disabled = false;
        btn.textContent = original;
      },
      (err) => {
        let msg = 'تعذر الحصول على الموقع';
        if (err.code === 1) msg = 'تم رفض إذن الوصول للموقع';
        if (err.code === 2) msg = 'الموقع غير متاح';
        if (err.code === 3) msg = 'انتهت مدة تحديد الموقع';
        window.UI.toast(msg, 'error');

        btn.disabled = false;
        btn.textContent = original;
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  /* ---------------------------------------------------------------- */
  /*  تحميل البيانات من الـ API                                       */
  /* ---------------------------------------------------------------- */
  async function loadProfile() {
    /* استخرج الـ token من آخر جزء في الرابط */
    const parts = window.location.pathname.split('/').filter(Boolean);
    const token = parts[parts.length - 1];

    if (!token || token === 'emergency') {
      return showNotFound();
    }

    try {
      /* استدعاء الـ API بدون توثيق (public) */
      const res = await window.API.get(`/emergency/${encodeURIComponent(token)}`, {
        auth: false
      });

      const data = res?.data;
      if (!data || !data.fullName) {
        return showNotFound();
      }

      fillProfile(data);

      /* إخفاء اللودر + إظهار المحتوى */
      $('emergencyLoader').classList.add('hidden');
      $('emergencyContent').classList.remove('hidden');

      /* تغيير عنوان الصفحة */
      document.title = `طوارئ — ${data.fullName} | SafeID`;
    } catch (err) {
      /* أي خطأ (404, 500, network) → نعرض صفحة "غير موجود" */
      showNotFound();
    }
  }

  /* ---------------------------------------------------------------- */
  /*  بدء التشغيل                                                     */
  /* ---------------------------------------------------------------- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadProfile);
  } else {
    loadProfile();
  }
})();

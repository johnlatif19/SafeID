/* SafeID — QR utilities */
(function () {
  async function generateDataUrl(text) {
    /* Uses server-side QR image, but if not available, we use the QR image URL from the server */
    const res = await fetch(`${window.SAFEID_CONFIG.API_BASE}/qr/image?text=${encodeURIComponent(text)}`);
    if (!res.ok) throw new Error('Failed to generate QR');
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  }

  function download(url, filename = 'safeid-qr.png') {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  }

  function print(url, name = 'SafeID') {
    const w = window.open('', '_blank', 'width=600,height=700');
    w.document.write(`
      <html><head><title>SafeID QR — ${name}</title>
      <style>body{font-family:sans-serif;text-align:center;padding:40px}
      img{width:340px;height:340px}</style></head>
      <body>
        <h2>${name}</h2>
        <p>Scan for emergency information</p>
        <img src="${url}" />
        <p style="margin-top:20px;color:#666">Powered by SafeID</p>
        <script>window.onload=()=>window.print()</script>
      </body></html>`);
    w.document.close();
  }

  async function copy(text) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch { return false; }
  }

  window.QR = { generateDataUrl, download, print, copy };
})();
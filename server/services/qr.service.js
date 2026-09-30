const QRCode = require('qrcode');
const QrToken = require('../models/QrToken');

function emergencyUrl(token) {
  const base = process.env.BASE_URL || 'http://localhost:3000';
  return `${base}/emergency/${token}`;
}

async function generateQRDataUrl(token) {
  const url = emergencyUrl(token);
  return QRCode.toDataURL(url, {
    errorCorrectionLevel: 'H',
    margin: 1,
    width: 320,
    color: { dark: '#0A2540', light: '#FFFFFF' }
  });
}

async function generateQRBuffer(text) {
  return QRCode.toBuffer(text, {
    errorCorrectionLevel: 'H',
    margin: 1,
    width: 320,
    color: { dark: '#0A2540', light: '#FFFFFF' }
  });
}

async function getOrCreateForPatient(patient) {
  let qr = await QrToken.findActiveByPatientId(patient._id);
  if (!qr) qr = await QrToken.createToken({ patientId: patient._id, safeid: patient.safeid });
  const image = await generateQRDataUrl(qr.token);
  return { qr, image, url: emergencyUrl(qr.token) };
}

module.exports = { emergencyUrl, generateQRDataUrl, generateQRBuffer, getOrCreateForPatient };
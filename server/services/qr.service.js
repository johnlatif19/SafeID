async function getOrCreateForPatient(patient) {
  let qr = await QrToken.findActiveByPatientId(patient._id);
  if (!qr) qr = await QrToken.createToken({ patientId: patient._id, safeid: patient.safeid });
  const image = await generateQRDataUrl(qr.token);
  return { qr, image, url: emergencyUrl(qr.token) };
}

module.exports = {
  emergencyUrl,
  generateQRDataUrl,
  generateQRBuffer,
  getOrCreateForPatient
};

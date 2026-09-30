const QRCode = require('qrcode');
const QrService = require('../services/qr.service');
const { ok, badRequest } = require('../utils/response');

async function image(req, res, next) {
  try {
    const text = req.query.text;
    if (!text) return badRequest(res, 'Missing text');
    const buf = await QrService.generateQRBuffer(text);
    res.set('Content-Type', 'image/png');
    return res.send(buf);
  } catch (err) { next(err); }
}

async function getForPatient(req, res, next) {
  try {
    const Patient = require('../models/Patient');
    const patient = await Patient.findById(req.user._id);
    if (!patient) return badRequest(res, 'Patient not found');
    const result = await QrService.getOrCreateForPatient(patient);
    return ok(res, { data: { image: result.image, url: result.url, token: result.qr.token } });
  } catch (err) { next(err); }
}

module.exports = { image, getForPatient };
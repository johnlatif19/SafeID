const AdminService = require('../services/admin.service');
const QrToken = require('../models/QrToken');
const Patient = require('../models/Patient');
const QrService = require('../services/qr.service');
const { ok } = require('../utils/response');

async function stats(req, res, next) {
  try { return ok(res, { data: await AdminService.getStats() }); }
  catch (err) { next(err); }
}

async function listPatients(req, res, next) {
  try {
    const list = await AdminService.listPatients(req.query.search || '');
    return ok(res, { data: list });
  } catch (err) { next(err); }
}

async function getPatient(req, res, next) {
  try {
    const p = await Patient.findById(req.params.id);
    if (!p) return res.status(404).json({ success: false, message: 'Patient not found' });
    return ok(res, { data: p });
  } catch (err) { next(err); }
}

async function togglePatient(req, res, next) {
  try {
    const r = await AdminService.togglePatient(req.params.id);
    return ok(res, { data: r }, 'Patient status updated');
  } catch (err) { next(err); }
}

async function listParents(req, res, next) {
  try {
    const list = await AdminService.listParents(req.query.search || '');
    return ok(res, { data: list });
  } catch (err) { next(err); }
}

async function toggleParent(req, res, next) {
  try {
    const r = await AdminService.toggleParent(req.params.id);
    return ok(res, { data: r }, 'Parent status updated');
  } catch (err) { next(err); }
}

async function listEmergencies(req, res, next) {
  try {
    const list = await AdminService.listEmergencies({
      date: req.query.date, status: req.query.status
    });
    return ok(res, { data: list });
  } catch (err) { next(err); }
}

async function recentEmergencies(req, res, next) {
  try {
    const list = await AdminService.listEmergencies();
    return ok(res, { data: list.slice(0, 10) });
  } catch (err) { next(err); }
}

async function listQr(req, res, next) {
  try {
    const list = await AdminService.listQr(req.query.search || '');
    return ok(res, { data: list });
  } catch (err) { next(err); }
}

async function regenerateQr(req, res, next) {
  try {
    const token = await QrToken.listAll();
    const found = token.find((t) => t._id === req.params.id);
    if (!found) return res.status(404).json({ success: false, message: 'QR not found' });
    const newToken = await QrToken.regenerate(found.patientId, found.safeid);
    const image = await QrService.generateQRDataUrl(newToken.token);
    return ok(res, { data: { ...newToken, image } }, 'QR regenerated');
  } catch (err) { next(err); }
}

async function toggleQr(req, res, next) {
  try {
    const t = await QrToken.toggle(req.params.id);
    return ok(res, { data: t }, 'QR status updated');
  } catch (err) { next(err); }
}

module.exports = {
  stats, listPatients, getPatient, togglePatient,
  listParents, toggleParent, listEmergencies, recentEmergencies,
  listQr, regenerateQr, toggleQr
};
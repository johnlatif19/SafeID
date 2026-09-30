const User = require('../models/User');
const Patient = require('../models/Patient');
const Parent = require('../models/Parent');
const QrToken = require('../models/QrToken');
const EmergencyScan = require('../models/EmergencyScan');

async function getStats() {
  const [patients, parents] = await Promise.all([
    Patient.listAll(),
    Parent.listAll()
  ]);
  const qrAll = await QrToken.listAll();
  const activeIds = qrAll.filter((q) => q.active).length;
  const scans = await EmergencyScan.countAll();
  return {
    patients: patients.length,
    parents: parents.length,
    activeIds,
    scans
  };
}

async function listPatients(search = '') {
  const list = search ? await Patient.searchByNameOrSafeid(search) : await Patient.listAll();
  return list.map((p) => ({
    _id: p._id, fullName: p.fullName, safeid: p.safeid,
    email: p.email, phone: p.phone, status: p.status, createdAt: p.createdAt
  }));
}

async function togglePatient(userId) {
  const user = await User.findById(userId);
  if (!user) throw new Error('Patient not found');
  const newStatus = user.status === 'active' ? 'disabled' : 'active';
  await User.updateUser(userId, { status: newStatus });
  await Patient.update(userId, { status: newStatus });
  return { status: newStatus };
}

async function listParents(search = '') {
  const all = await Parent.listAll();
  const s = (search || '').toLowerCase();
  const filtered = s ? all.filter((p) =>
    (p.fullName || '').toLowerCase().includes(s) ||
    (p.email || '').toLowerCase().includes(s)
  ) : all;
  return filtered.map((p) => ({
    _id: p._id, fullName: p.fullName, email: p.email, phone: p.phone,
    childrenCount: (p.children || []).length, status: p.status
  }));
}

async function toggleParent(userId) {
  const user = await User.findById(userId);
  if (!user) throw new Error('Parent not found');
  const newStatus = user.status === 'active' ? 'disabled' : 'active';
  await User.updateUser(userId, { status: newStatus });
  await Parent.update(userId, { status: newStatus });
  return { status: newStatus };
}

async function listEmergencies({ date, status } = {}) {
  let list = await EmergencyScan.listAll();
  if (date) list = list.filter((e) => e.createdAt.startsWith(date));
  if (status) list = list.filter((e) => e.status === status);

  const enriched = await Promise.all(list.map(async (e) => {
    const patient = await Patient.findById(e.patientId);
    return {
      id: e._id,
      patientName: patient?.fullName || 'Unknown',
      createdAt: e.createdAt,
      status: e.status
    };
  }));
  return enriched;
}

async function listQr(search = '') {
  const all = await QrToken.listAll();
  const s = (search || '').toLowerCase();
  const filtered = s ? all.filter((q) => (q.safeid || '').toLowerCase().includes(s)) : all;

  return Promise.all(filtered.map(async (q) => {
    const p = await Patient.findById(q.patientId);
    return {
      _id: q._id, safeid: q.safeid, active: q.active,
      ownerName: p?.fullName || 'Unknown'
    };
  }));
}

module.exports = {
  getStats, listPatients, togglePatient,
  listParents, toggleParent, listEmergencies, listQr
};
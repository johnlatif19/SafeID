const Parent = require('../models/Parent');
const Patient = require('../models/Patient');
const Notification = require('../models/Notification');
const EmergencyScan = require('../models/EmergencyScan');
const QrService = require('./qr.service');

async function getChildren(parentId) {
  const parent = await Parent.findById(parentId);
  if (!parent) throw new Error('Parent not found');

  const children = await Promise.all((parent.children || []).map(async (childId) => {
    const p = await Patient.findById(childId);
    if (!p) return null;
    const { image } = await QrService.getOrCreateForPatient(p);
    const age = p.dob ? Math.floor((Date.now() - new Date(p.dob)) / (365.25 * 24 * 3600 * 1000)) : null;
    return {
      _id: p._id, fullName: p.fullName, photo: p.photo, safeid: p.safeid,
      bloodType: p.bloodType, status: p.status, age, qrImage: image
    };
  }));

  return children.filter(Boolean);
}

async function linkChildBySafeid(parentId, safeid) {
  const patient = await Patient.findBySafeid(safeid);
  if (!patient) throw new Error('No patient with this SafeID');
  await Parent.linkChild(parentId, patient._id);
  await Notification.create({
    parentId,
    title: 'Child linked',
    message: `${patient.fullName} has been linked to your account.`
  });
  return true;
}

async function getStats(parentId) {
  const parent = await Parent.findById(parentId);
  if (!parent) throw new Error('Parent not found');
  const childrenCount = (parent.children || []).length;
  const notifications = await Notification.countByParent(parentId);
  const scans = await EmergencyScan.countAll();
  return { children: childrenCount, notifications, scans };
}

async function listNotifications(parentId) {
  return Notification.listByParent(parentId);
}

module.exports = { getChildren, linkChildBySafeid, getStats, listNotifications };
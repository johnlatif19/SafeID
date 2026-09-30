const Notification = require('../models/Notification');

async function create(data) {
  return Notification.create(data);
}

async function listByParent(parentId) {
  return Notification.listByParent(parentId);
}

async function countByParent(parentId) {
  return Notification.countByParent(parentId);
}

module.exports = { create, listByParent, countByParent };
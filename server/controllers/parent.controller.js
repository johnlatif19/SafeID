const ParentService = require('../services/parent.service');
const { ok, badRequest } = require('../utils/response');

async function getChildren(req, res, next) {
  try {
    const children = await ParentService.getChildren(req.user._id);
    return ok(res, { data: children });
  } catch (err) { next(err); }
}

async function linkChild(req, res, next) {
  try {
    const { safeid } = req.body;
    if (!safeid) return badRequest(res, 'SafeID is required');
    await ParentService.linkChildBySafeid(req.user._id, safeid);
    return ok(res, {}, 'Child linked');
  } catch (err) {
    if (err.message.includes('No patient')) return badRequest(res, err.message);
    next(err);
  }
}

async function getStats(req, res, next) {
  try {
    const stats = await ParentService.getStats(req.user._id);
    return ok(res, { data: stats });
  } catch (err) { next(err); }
}

async function notifications(req, res, next) {
  try {
    const list = await ParentService.listNotifications(req.user._id);
    return ok(res, { data: list });
  } catch (err) { next(err); }
}

module.exports = { getChildren, linkChild, getStats, notifications };
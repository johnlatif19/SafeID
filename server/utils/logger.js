function log(level, msg, meta = {}) {
  const time = new Date().toISOString();
  console.log(`[${time}] [${level.toUpperCase()}] ${msg}`, Object.keys(meta).length ? meta : '');
}

module.exports = {
  info: (m, meta) => log('info', m, meta),
  warn: (m, meta) => log('warn', m, meta),
  error: (m, meta) => log('error', m, meta)
};
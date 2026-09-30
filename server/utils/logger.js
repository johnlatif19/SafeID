/* SafeID — Simple logger */

function log(level, msg, meta = {}) {
  const time = new Date().toISOString();
  const hasMeta = meta && Object.keys(meta).length > 0;
  console.log(`[${time}] [${level.toUpperCase()}] ${msg}`, hasMeta ? meta : '');
}

module.exports = {
  info:  (m, meta) => log('info', m, meta),
  warn:  (m, meta) => log('warn', m, meta),
  error: (m, meta) => log('error', m, meta)
};

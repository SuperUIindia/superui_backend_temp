/**
 * CSV cell sanitization to prevent formula injection / DDE attacks in Excel and spreadsheet apps.
 * Any cell value starting with '=', '+', '-', '@', '\t', or '\r' is escaped with a leading apostrophe.
 */
function sanitizeCsvValue(val) {
  if (val === null || val === undefined) return '""';
  let str = String(val).trim();
  const dangerousChars = ['=', '+', '-', '@', '\t', '\r'];
  if (str.length > 0 && dangerousChars.includes(str.charAt(0))) {
    str = "'" + str;
  }
  // Escape embedded double quotes by doubling them
  str = str.replace(/"/g, '""');
  return `"${str}"`;
}

module.exports = {
  sanitizeCsvValue
};


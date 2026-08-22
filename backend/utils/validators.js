const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
exports.isEmail = (s) => typeof s === 'string' && EMAIL_RE.test(s);
exports.isStrongPassword = (s) => typeof s === 'string' && s.length >= 6;
exports.isNonEmptyString = (s) => typeof s === 'string' && s.trim().length > 0;
exports.isPositiveInteger = (n) => Number.isInteger(n) && n > 0;
exports.sanitizeString = (s) => (typeof s === 'string' ? s.trim() : s);
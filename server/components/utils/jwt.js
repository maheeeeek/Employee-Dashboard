const jwt = require('jsonwebtoken');
const { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, ACCESS_TOKEN_EXP, REFRESH_TOKEN_EXP } = process.env;

function signAccess(payload) {
  return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_EXP || '15m' });
}
function signRefresh(payload) {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXP || '7d' });
}
function verifyAccess(token) {
  return jwt.verify(token, JWT_ACCESS_SECRET);
}
function verifyRefresh(token) {
  return jwt.verify(token, JWT_REFRESH_SECRET);
}

module.exports = { signAccess, signRefresh, verifyAccess, verifyRefresh };

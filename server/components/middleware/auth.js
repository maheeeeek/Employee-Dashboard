// server/src/middleware/auth.js
const { verifyAccess, verifyRefresh, signAccess, signRefresh } = require('../utils/jwt');
const User = require('../models/user.model');

// protect middleware
async function protect(req, res, next) {
  try {
    const token = req.cookies?.accessToken;
    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    const decoded = verifyAccess(token);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'User not found' });

    req.user = user;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}


function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
}







// refresh handler (callable from a route)
async function refreshHandler(req, res) {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: 'No refresh token' });

    const payload = verifyRefresh(refreshToken);
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ message: 'Invalid refresh' });

    // Issue new tokens
    const accessToken = signAccess({ id: user._id });
    const newRefreshToken = signRefresh({ id: user._id });

    // Optionally save the refresh token to DB
    user.refreshToken = newRefreshToken;
    await user.save();

    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('accessToken', accessToken, { httpOnly: true, secure: isProd, sameSite: 'lax', maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', newRefreshToken, { httpOnly: true, secure: isProd, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.json({ ok: true });
  } catch (err) {
    console.error('refresh error', err);
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
}

module.exports = { protect, refreshHandler , authorize };

const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const { signAccess, signRefresh, verifyRefresh } = require('../utils/jwt');

const SALT_ROUNDS = 12;

const cookieOptions = (isProd) => ({
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'lax' : 'none',
  signed: false,
});

async function register(req, res) {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: 'Name, email and password are required' });

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'User already exists' });

  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ name, email, password: hash });

  const accessToken = signAccess({ id: user._id });
  const refreshToken = signRefresh({ id: user._id });

  user.refreshToken = refreshToken;
  await user.save();

  const isProd = process.env.NODE_ENV === 'production';

  res.cookie('accessToken', accessToken, {
    ...cookieOptions(isProd),
    maxAge: 15 * 60 * 1000,
  });
  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions(isProd),
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(201).json({ id: user._id, name: user.name, email: user.email });
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required' });

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: 'Invalid credentials' });

  const accessToken = signAccess({ id: user._id });
  const refreshToken = signRefresh({ id: user._id });

  user.refreshToken = refreshToken;
  await user.save();

  const isProd = process.env.NODE_ENV === 'production';

  res.cookie('accessToken', accessToken, {
    ...cookieOptions(isProd),
    maxAge: 15 * 60 * 1000,
  });
  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions(isProd),
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
}

async function logout(req, res) {
  const refreshToken = req.cookies?.refreshToken;

  if (refreshToken) {
    try {
      const payload = verifyRefresh(refreshToken);
      if (payload?.id) {
        await User.findByIdAndUpdate(payload.id, { $unset: { refreshToken: 1 } });
      }
    } catch (e) {
      // ignore
    }
  }

  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie('accessToken', cookieOptions(isProd));
  res.clearCookie('refreshToken', cookieOptions(isProd));

  return res.json({ ok: true });
}

// ← THIS LINE WAS THE PROBLEM – re-type it manually!
module.exports = { register, login, logout };
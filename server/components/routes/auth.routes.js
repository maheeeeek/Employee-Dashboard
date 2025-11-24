const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/auth.controllers'); 
const { protect, refreshHandler } = require('../middleware/auth');

// public endpoints
router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.post('/logout', ctrl.logout);

// protected and helper endpoints
router.get('/me', protect, (req, res) => {
  res.json(req.user);
});

router.get('/refresh', refreshHandler);

module.exports = router;

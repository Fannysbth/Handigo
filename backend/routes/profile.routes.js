const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/profile.controller');
const { authenticate } = require('../middleware/auth.middleware');

console.log('🔥 PROFILE ROUTES FILE LOADED'); // ✅ TARUH DI SINI

router.use(authenticate);

router.get('/', (req, res, next) => {
  console.log('👉 HIT /api/profile');
  next();
}, getProfile);
router.put('/', updateProfile);

module.exports = router;
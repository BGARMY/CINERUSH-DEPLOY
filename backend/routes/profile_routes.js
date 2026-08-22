const express = require('express');
const router = express.Router();
const profile = require('../controllers/profile_controller');

router.get('/', profile.getProfile);
router.patch('/', profile.updateProfile);

module.exports = router;
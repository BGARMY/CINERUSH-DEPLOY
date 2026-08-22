const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const profileController = require('../controllers/profile.controller');

// GET current user's profile
router.get('/', protect, profileController.getProfile);

// PATCH update profile
router.patch('/', protect, profileController.updateProfile);

module.exports = router;
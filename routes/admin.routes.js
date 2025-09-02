const express = require('express');
const router = express.Router();
const admin = require('../controllers/admin.controller.js');

// Admin login
router.post('/login', admin.login);

module.exports = router;
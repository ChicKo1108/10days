const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// User routes
router.get('/user/profile', userController.getProfile);
router.delete('/user/destroy', userController.destroyAccount);

// Auth routes
router.post('/auth/logout', userController.logout);

module.exports = router;

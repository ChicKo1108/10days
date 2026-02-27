const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// User routes
router.get('/user/profile', authMiddleware, userController.getProfile);
router.delete('/user/destroy', authMiddleware, userController.destroyAccount);

// Auth routes
router.post('/auth/login', authController.login);
router.post('/auth/logout', userController.logout);

module.exports = router;

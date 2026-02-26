const express = require('express');
const router = express.Router();

const questRoutes = require('./questRoutes');
const planRoutes = require('./planRoutes');
const userRoutes = require('./userRoutes');

// Mount sub-routers
router.use('/quests', questRoutes);
router.use('/plans', planRoutes);
router.use('/', userRoutes); // user routes handle their own prefix (/user/..., /auth/...)

module.exports = router;

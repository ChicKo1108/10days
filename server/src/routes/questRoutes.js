const express = require('express');
const router = express.Router();
const questController = require('../controllers/questController');
const reviewController = require('../controllers/reviewController');

// Quest routes
router.get('/', questController.getQuests);
router.get('/:id', questController.getQuestDetail);
router.put('/:id', questController.updateQuest);
router.post('/:id/checkin', questController.checkIn);
router.post('/:id/skip', questController.skipTask);

// Review routes (nested under quest)
router.get('/:id/review', reviewController.getReview);

module.exports = router;

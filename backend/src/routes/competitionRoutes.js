const express = require('express');
const competitionController = require('../controllers/competitionController');
const registrationController = require('../controllers/registrationController');
const { protect, attachUserIfPresent } = require('../middleware/auth');
const { registrationLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.get('/', competitionController.listCompetitions);
router.get('/:idOrSlug', attachUserIfPresent, competitionController.getCompetition);
router.post('/:idOrSlug/register', protect, registrationLimiter, registrationController.registerForCompetition);

module.exports = router;

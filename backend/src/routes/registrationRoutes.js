const express = require('express');
const registrationController = require('../controllers/registrationController');
const submissionController = require('../controllers/submissionController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/:registrationId/confirm-payment', protect, registrationController.confirmPayment);
router.post('/:registrationId/cancel', protect, registrationController.cancelRegistration);
router.post('/:registrationId/submission', protect, upload.single('media'), submissionController.createSubmission);

module.exports = router;

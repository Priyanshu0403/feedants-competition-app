const express = require('express');
const authRoutes = require('./authRoutes');
const competitionRoutes = require('./competitionRoutes');
const registrationRoutes = require('./registrationRoutes');

const router = express.Router();

router.get('/health', (req, res) => res.json({ success: true, message: 'OK', timestamp: new Date().toISOString() }));
router.use('/auth', authRoutes);
router.use('/competitions', competitionRoutes);
router.use('/registrations', registrationRoutes);

module.exports = router;

// Coach Routes
const express = require('express');
const router = express.Router();
const coachController = require('../controllers/coachController');

router.get('/', coachController.getAllCoaches);
router.get('/:id', coachController.getCoachById);
router.post('/', coachController.createCoach);

module.exports = router;

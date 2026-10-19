// Turf Routes
const express = require('express');
const router = express.Router();
const turfController = require('../controllers/turfController');

router.get('/', turfController.getAllTurfs);
router.get('/:id', turfController.getTurfById);
router.post('/', turfController.createTurf);

module.exports = router;

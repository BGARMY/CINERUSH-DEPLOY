const express = require('express');
const router = express.Router();
const seatController = require('../controllers/seat_controller');

router.get('/:showtimeId/seats', seatController.getSeats);
router.post('/:showtimeId/book', seatController.bookSeats);

module.exports = router;
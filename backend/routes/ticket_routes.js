const express = require('express');
const router = express.Router();
const { getTicketByBookingId } = require('../controllers/ticket_controller');

router.get('/:id', getTicketByBookingId);

module.exports = router;


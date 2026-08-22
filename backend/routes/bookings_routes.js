const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking_controller');

// ----------------------
// POST /api/bookings/create
// Create a booking
// ----------------------
router.post('/create', bookingController.createBooking);

// ----------------------
// GET /api/bookings/booked-seats?showtimeId=123
// Get all booked seats for a showtime (returns { bookedSeats: [...] })
// ----------------------
router.get('/booked-seats', bookingController.getBookedSeatsForShowtime);

// ----------------------
// GET /api/bookings/tickets?userId=1
// Get all tickets for a user
// ----------------------
router.get('/tickets', async (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });
  try {
    const [rows] = await require('../config/db').query(
      `SELECT b.id, b.seat_number, b.booking_time, b.status,
              m.title AS movie_title, s.cinema_name, s.show_date, s.show_time
       FROM bookings b
       JOIN showtimes s ON b.showtime_id = s.id
       JOIN movies m ON s.movie_id = m.id
       WHERE b.user_id = ?
       ORDER BY b.booking_time DESC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching tickets:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ----------------------
// POST /api/bookings/confirm-payment
// Confirms payment (legacy route)
// ----------------------
router.post('/confirm-payment', bookingController.confirmPayment);

// ----------------------
// POST /api/bookings/confirm
// Confirms payment (recommended route)
// ----------------------
router.post('/confirm', bookingController.confirmPayment);

// ----------------------
// GET /api/bookings/success
// Ticket generation after success
// ----------------------
router.get('/success', bookingController.getBookingSuccess);

// ----------------------
// GET /api/bookings/:id
// Fetch booking by ID
// ----------------------
router.get('/:id', bookingController.getBookingById);

module.exports = router;
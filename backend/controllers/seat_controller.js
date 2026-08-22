const pool = require('../config/db');
const { isPositiveInteger, sanitizeString } = require('../utils/validators');

/**
 * Get all seats for a showtime
 * GET /api/seats/:showtimeId
 */
exports.getSeats = async (req, res) => {
  try {
    const showtimeId = parseInt(req.params.showtimeId, 10);
    if (!isPositiveInteger(showtimeId)) {
      return res.status(400).json({ error: 'Invalid showtimeId' });
    }

    const [rows] = await pool.query(
      'SELECT id, seat_label, is_booked FROM seats WHERE showtime_id = ?',
      [showtimeId]
    );
    res.json(rows);
  } catch (e) {
    console.error('Error fetching seats:', e);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Book multiple seats atomically for a showtime
 * POST /api/seats/:showtimeId/book
 * Body: { seats: [seatLabel1, seatLabel2, ...], user_id: int }
 */
exports.bookSeats = async (req, res) => {
  try {
    const showtimeId = parseInt(req.params.showtimeId, 10);
    const { seats, user_id } = req.body;

    // Validate input
    if (
      !isPositiveInteger(showtimeId) ||
      !Array.isArray(seats) ||
      seats.length === 0 ||
      !isPositiveInteger(user_id)
    ) {
      return res.status(400).json({
        error: 'Invalid request: showtimeId (int), seats (non-empty array), user_id (int) required'
      });
    }

    // Sanitize seat labels
    const sanitizedSeats = seats.map(sanitizeString);
    const placeholders = sanitizedSeats.map(() => '?').join(',');

    // Check seat existence and booking status
    const [existing] = await pool.query(
      `SELECT seat_label, is_booked FROM seats WHERE showtime_id = ? AND seat_label IN (${placeholders})`,
      [showtimeId, ...sanitizedSeats]
    );
    if (existing.length !== sanitizedSeats.length) {
      return res.status(404).json({ error: 'One or more seats not found for this showtime' });
    }
    const alreadyBooked = existing.filter(r => r.is_booked);
    if (alreadyBooked.length) {
      return res.status(409).json({
        error: 'Some seats are already booked',
        seats: alreadyBooked.map(a => a.seat_label)
      });
    }

    // Atomic booking using transaction
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [updateRes] = await conn.query(
        `UPDATE seats SET is_booked = 1 WHERE showtime_id = ? AND seat_label IN (${placeholders}) AND is_booked = 0`,
        [showtimeId, ...sanitizedSeats]
      );
      if (updateRes.affectedRows !== sanitizedSeats.length) {
        await conn.rollback();
        return res.status(409).json({
          error: 'Race condition: some seats were just booked by others'
        });
      }
      await conn.commit();
      res.json({ success: true, booked: sanitizedSeats });
    } catch (e) {
      await conn.rollback();
      console.error('Error booking seats:', e);
      res.status(500).json({ error: 'Failed to book seats' });
    } finally {
      conn.release();
    }
  } catch (e) {
    console.error('Server error:', e);
    res.status(500).json({ error: 'Server error' });
  }
};
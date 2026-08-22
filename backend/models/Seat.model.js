// models/seat.model.js

const pool = require('../config/db'); // adjust path

const Seat = {
  /**
   * Add one or more seats to a booking
   * @param {number} bookingId
   * @param {string[]} seats - array of seat numbers like ['A1', 'B2']
   */
  addSeatsForBooking: async (bookingId, seats) => {
    if (!Array.isArray(seats) || seats.length === 0) {
      throw new Error("No seats provided.");
    }

    const seatValues = seats.map(seat => [bookingId, seat]);

    const [result] = await pool.query(
      `INSERT INTO booking_seats (booking_id, seat_number) VALUES ?`,
      [seatValues]
    );

    return result;
  },

  getSeatsByBookingId: async (bookingId) => {
    const [rows] = await pool.query(
      `SELECT seat_number FROM booking_seats WHERE booking_id = ?`,
      [bookingId]
    );
    return rows;
  }
};

module.exports = Seat;

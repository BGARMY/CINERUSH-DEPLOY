const db = require('../config/db');

// Callback-based functions
const createBooking = (user_id, movie_id, seat_number, callback) => {
  const sql = `
    INSERT INTO bookings (user_id, movie_id, seat_number, status)
    VALUES (?, ?, ?, 'pending')
  `;
  db.query(sql, [user_id, movie_id, seat_number], callback);
};

const getBookingById = (bookingId, callback) => {
  const sql = `SELECT * FROM bookings WHERE id = ?`;
  db.query(sql, [bookingId], callback);
};

const updateBookingStatus = (bookingId, status, paymentMethod, callback) => {
  const sql = `
    UPDATE bookings
    SET status = ?, payment_method = ?
    WHERE id = ?
  `;
  db.query(sql, [status, paymentMethod, bookingId], callback);
};

// Promise-based versions (optional, for async/await)
const createBookingAsync = async (user_id, movie_id, seat_number) => {
  const sql = `
    INSERT INTO bookings (user_id, movie_id, seat_number, status)
    VALUES (?, ?, ?, 'pending')
  `;
  const [result] = await db.query(sql, [user_id, movie_id, seat_number]);
  return result;
};

const getBookingByIdAsync = async (bookingId) => {
  const sql = `SELECT * FROM bookings WHERE id = ?`;
  const [rows] = await db.query(sql, [bookingId]);
  return rows[0];
};

const updateBookingStatusAsync = async (bookingId, status, paymentMethod) => {
  const sql = `
    UPDATE bookings
    SET status = ?, payment_method = ?
    WHERE id = ?
  `;
  const [result] = await db.query(sql, [status, paymentMethod, bookingId]);
  return result;
};

module.exports = {
  createBooking,
  getBookingById,
  updateBookingStatus,
  createBookingAsync,
  getBookingByIdAsync,
  updateBookingStatusAsync,
};
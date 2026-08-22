const pool = require("../config/db");

// Helper: format MySQL DATETIME string
function formatDateTime(show_date, show_time) {
  try {
    const d = new Date(show_date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");

    let t = show_time;
    if (/^\d{2}:\d{2}$/.test(t)) {
      t = `${t}:00`;
    }

    return `${yyyy}-${mm}-${dd} ${t}`;
  } catch (err) {
    console.error("formatDateTime error:", err, show_date, show_time);
    return null;
  }
}

/**
 * 1. Create a new booking
 * POST /api/bookings
 */
exports.createBooking = async (req, res) => {
  try {
    const uid = req.body.userId || req.body.user_id;
    const sid = req.body.showtimeId || req.body.showtime_id;
    const seats =
      req.body.seats || req.body.seatNumbers || req.body.seat_numbers;

    if (!uid || !sid || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Missing fields: userId, showtimeId, seats[] required",
      });
    }

    // Save all seats as a comma-separated string
    const seatNumbers = seats.join(",");
    const [result] = await pool.query(
      "INSERT INTO bookings (user_id, showtime_id, seat_number, status) VALUES (?, ?, ?, ?)",
      [uid, sid, seatNumbers, "pending"]
    );

    // Fetch updated booked seats for the showtime
    const bookedSeats = await getBookedSeatsForShowtimeHelper(sid);

    return res
      .status(201)
      .json({ success: true, bookingIds: [result.insertId], bookedSeats });
  } catch (e) {
    console.error("createBooking error", e);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * 2. Confirm payment (and issue ticket + mark seats as booked)
 * POST /api/bookings/confirm
 */
exports.confirmPayment = async (req, res) => {
  try {
    let { bookingIds, bookingId, amount, paymentStatus, transactionId } =
      req.body;

    if (bookingId && !bookingIds) bookingIds = [bookingId];
    bookingIds = (bookingIds || []).filter((id) => id);

    if (
      !Array.isArray(bookingIds) ||
      bookingIds.length === 0 ||
      !paymentStatus
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid bookingIds[] and paymentStatus required",
      });
    }

    // Update all bookings with payment info
    await pool.query(
      `UPDATE bookings SET status = ?, amount = ?, transaction_id = ? WHERE id IN (${bookingIds.map(() => '?').join(',')})`,
      [
        paymentStatus === "confirmed" ? "booked" : "failed",
        amount,
        transactionId,
        ...bookingIds,
      ]
    );

    let showtimeIdForSeats = null;

    // ✅ If confirmed, mark seats as booked and generate tickets
    if (paymentStatus === "confirmed") {
      for (const id of bookingIds) {
        // Get booking + related data
        const [rows] = await pool.query(
          `SELECT b.id AS booking_id, b.seat_number, b.showtime_id,
                  s.cinema_name, s.show_date, s.show_time,
                  m.title AS movie_title
           FROM bookings b
           JOIN showtimes s ON b.showtime_id = s.id
           JOIN movies m ON s.movie_id = m.id
           WHERE b.id = ?`,
          [id]
        );

        if (rows.length) {
          const booking = rows[0];
          const formattedShowTime = formatDateTime(
            booking.show_date,
            booking.show_time
          );

          // ✅ Mark those seats as booked in seats table
          const seatsArray = booking.seat_number
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
          if (seatsArray.length) {
            const placeholders = seatsArray.map(() => "?").join(",");
            await pool.query(
              `UPDATE seats 
               SET is_booked = 1 
               WHERE showtime_id = ? 
               AND seat_label IN (${placeholders})`,
              [booking.showtime_id, ...seatsArray]
            );
          }

          // ✅ Generate ticket
          await pool.query(
            `INSERT INTO tickets 
               (booking_id, movie_title, cinema_name, seats, show_time)
             VALUES (?, ?, ?, ?, ?)`,
            [
              booking.booking_id,
              booking.movie_title,
              booking.cinema_name,
              booking.seat_number,
              formattedShowTime,
            ]
          );

          // Save showtimeId for fetching booked seats
          showtimeIdForSeats = booking.showtime_id;
        }
      }
    }

    // Fetch updated booked seats for the showtime (if available)
    let bookedSeats = [];
    if (showtimeIdForSeats) {
      bookedSeats = await getBookedSeatsForShowtimeHelper(showtimeIdForSeats);
    }

    return res.json({
      success: true,
      message: "Payment processed",
      bookingIds,
      bookedSeats,
    });
  } catch (e) {
    console.error("confirmPayment error", e);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * 3. Get booking success summary
 * GET /api/bookings/success?ids=1,2,3
 */
exports.getBookingSuccess = async (req, res) => {
  try {
    const idsParam = req.query.ids;
    if (!idsParam)
      return res.status(400).json({ error: "Missing booking id(s)" });

    const bookingIds = idsParam
      .split(",")
      .map((id) => parseInt(id))
      .filter((id) => !isNaN(id));

    if (!bookingIds.length)
      return res.status(400).json({ error: "Invalid booking id(s)" });

    const placeholders = bookingIds.map(() => '?').join(',');
    const [rows] = await pool.query(
      `SELECT b.id, b.seat_number, b.booking_time, b.status, b.amount,
              m.title AS movie_title, s.cinema_name, s.show_date, s.show_time
       FROM bookings b
       LEFT JOIN showtimes s ON b.showtime_id = s.id
       LEFT JOIN movies m ON s.movie_id = m.id
       WHERE b.id IN (${placeholders})`,
      bookingIds
    );

    if (!rows.length)
      return res.status(404).json({ error: "Bookings not found" });
    res.json(rows);
  } catch (e) {
    console.error("getBookingSuccess error", e);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * 4. Get single booking details
 * GET /api/bookings/:id
 */
exports.getBookingById = async (req, res) => {
  try {
    const bookingId = parseInt(req.params.id);
    if (!bookingId)
      return res.status(400).json({ error: "Missing booking id" });

    const [rows] = await pool.query(
      `SELECT b.id AS bookingId, b.seat_number AS seatNumber, b.status,
       m.title AS movieTitle, m.duration,
       s.cinema_name AS cinemaName,
       s.show_date, s.show_time
       FROM bookings b
       JOIN showtimes s ON b.showtime_id = s.id
       JOIN movies m ON s.movie_id = m.id
       WHERE b.id = ?`,
      [bookingId]
    );

    if (!rows.length)
      return res.status(404).json({ error: "Booking not found" });
    res.json(rows[0]);
  } catch (e) {
    console.error("getBookingById error", e);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * 5. Get all booked seats for a showtime
 * GET /api/bookings/booked-seats?showtimeId=123
 */
exports.getBookedSeatsForShowtime = async (req, res) => {
  try {
    const showtimeId = req.query.showtimeId || req.query.showtime_id;
    if (!showtimeId) {
      return res.status(400).json({ success: false, message: "Missing showtimeId" });
    }

    const bookedSeats = await getBookedSeatsForShowtimeHelper(showtimeId);

    res.json({ success: true, bookedSeats });
  } catch (e) {
    console.error("getBookedSeatsForShowtime error", e);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Helper function to get all booked seats for a showtime
async function getBookedSeatsForShowtimeHelper(showtimeId) {
  const [rows] = await pool.query(
    `SELECT seat_number FROM bookings WHERE showtime_id = ? AND status = 'booked'`,
    [showtimeId]
  );

  let bookedSeats = [];
  rows.forEach(row => {
    if (row.seat_number) {
      bookedSeats = bookedSeats.concat(row.seat_number.split(',').map(s => s.trim()));
    }
  });

  // Remove duplicates and sort
  bookedSeats = [...new Set(bookedSeats)].sort();

  return bookedSeats;
}
const db = require('../config/db');

// Get all movies
exports.getAllMovies = async () => {
  const [rows] = await db.query('SELECT * FROM movies');
  return rows;
};

// Get now playing movies
exports.getNowPlaying = async () => {
  const [rows] = await db.query("SELECT * FROM movies WHERE status = 'now_playing'");
  return rows;
};

// Get coming soon movies
exports.getComingSoon = async () => {
  const [rows] = await db.query("SELECT * FROM movies WHERE status = 'coming_soon'");
  return rows;
};

// Get movie by ID
exports.getMovieById = async (id) => {
  const [rows] = await db.query('SELECT * FROM movies WHERE id = ?', [id]);
  return rows[0] || null;
};

// Get movie booking data by title
exports.getMovieBookingData = async (title) => {
  const [rows] = await db.query(
    `SELECT m.title,
            m.duration AS runtime,
            m.poster_url,
            s.id AS showtime_id,
            s.cinema_name,
            TIME_FORMAT(s.show_time, '%H:%i:%s') AS show_time,
            DATE_FORMAT(s.show_date, '%Y-%m-%d') AS show_date,
            s.available_seats
     FROM movies m
     JOIN showtimes s ON m.id = s.movie_id
     WHERE LOWER(m.title) = LOWER(?)
       AND (
         s.show_date > DATE(CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '+05:30'))
         OR (
           s.show_date = DATE(CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '+05:30'))
           AND s.show_time >= TIME(CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '+05:30'))
         )
       )
     ORDER BY s.show_date, s.show_time`,
    [title]
  );

  return rows;
};
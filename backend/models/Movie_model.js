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
  // Return only upcoming showtimes (today or future). Also include an ISO datetime and unix timestamp
  const [rows] = await db.query(
    `SELECT m.title, m.duration AS runtime, m.poster_url,
            s.id AS showtime_id,
            s.cinema_name,
            s.show_time,
            s.show_date,
            s.available_seats,
            DATE_FORMAT(CONCAT(s.show_date, ' ', s.show_time), '%Y-%m-%dT%H:%i:%s') AS show_datetime_iso,
            UNIX_TIMESTAMP(CONCAT(s.show_date, ' ', s.show_time)) AS show_start_unix
     FROM movies m
     LEFT JOIN showtimes s ON m.id = s.movie_id
     WHERE LOWER(m.title) = LOWER(?)
       AND (s.show_date > CURDATE() OR (s.show_date = CURDATE() AND s.show_time >= CURTIME()))
     ORDER BY s.show_date, s.show_time`,
    [title]
  );
  return rows;
};
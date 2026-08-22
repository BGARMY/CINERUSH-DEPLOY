const Movie = require('../models/Movie_model');

exports.fetchAllMovies = async (req, res) => {
  try {
    const movies = await Movie.getAllMovies();
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getNowPlaying = async (req, res) => {
  try {
    const movies = await Movie.getNowPlaying();
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getComingSoon = async (req, res) => {
  try {
    const movies = await Movie.getComingSoon();
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMovieById = async (req, res) => {
  try {
    const { id } = req.params;
    const movie = await Movie.getMovieById(id);
    if (!movie) return res.status(404).json({ error: 'Movie not found' });
    res.json(movie);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMovieBookingData = async (req, res) => {
  try {
    const { title } = req.params;
    const results = await Movie.getMovieBookingData(title);
    if (!results || results.length === 0) return res.status(404).json({ error: 'Movie not found' });

    const movie = {
      title: results[0].title,
      runtime: results[0].runtime,
      poster_url: results[0].poster_url,
      cinema: {
        name: results[0].cinema_name
      },
      showtimes: results.map(r => ({
          // identifiers
          id: r.showtime_id || r.id,
          showtime_id: r.showtime_id || r.id,
          // original fields
          show_time: r.show_time,
          show_date: r.show_date,
          cinema_name: r.cinema_name,
          available_seats: r.available_seats || null,
          // helpful parsed fields for frontend
          show_datetime_iso: r.show_datetime_iso || null,
          show_start_unix: r.show_start_unix ? Number(r.show_start_unix) : null,
        })),
    };

    res.json(movie);
  } catch (err) {
    console.error("Error in getMovieBookingData:", err);
    res.status(500).json({ error: err.message });
  }
};
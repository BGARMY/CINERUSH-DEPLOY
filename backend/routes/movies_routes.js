const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movie_controller');

router.get('/', movieController.fetchAllMovies);
router.get('/now-playing', movieController.getNowPlaying);
router.get('/coming-soon', movieController.getComingSoon);
router.get('/booking/title/:title', movieController.getMovieBookingData);
router.get('/:id', movieController.getMovieById);

module.exports = router;

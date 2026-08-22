require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Core middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes
const userRoutes = require('./routes/user_routes');
const movieRoutes = require('./routes/movies_routes');
const seatRoutes = require('./routes/seat_routes');
const bookingsRoutes = require('./routes/bookings_routes');
const profileRoutes = require('./routes/profile');
const authRoutes = require('./routes/auth_routes');

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/auth', authRoutes);

// Health check
app.get('/', (_req, res) => res.send('CineRush API running...'));

// Error handler (last)
const { errorHandler } = require('./middleware/error.middleware');
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
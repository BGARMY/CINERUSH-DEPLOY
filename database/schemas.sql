-- CINERUSH schema for import
DROP DATABASE IF EXISTS cinerush;
CREATE DATABASE cinerush;
USE cinerush;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE movies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  duration INT CHECK (duration > 0),
  release_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50),
  poster_url VARCHAR(255)
);

CREATE TABLE showtimes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  movie_id INT NOT NULL,
  cinema_name VARCHAR(150) NOT NULL,
  show_date DATE NOT NULL,
  show_time TIME NOT NULL,
  available_seats INT DEFAULT 50 CHECK (available_seats >= 0),
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_movie_id (movie_id)
);

CREATE TABLE seats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  showtime_id INT NOT NULL,
  seat_label VARCHAR(10) NOT NULL,
  is_booked TINYINT(1) DEFAULT 0,
  FOREIGN KEY (showtime_id) REFERENCES showtimes(id) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY unique_seat (showtime_id, seat_label)
);

CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  showtime_id INT NOT NULL,
  seat_number TEXT NOT NULL, -- changed to TEXT for more seats
  status ENUM('pending','booked','cancelled'),
  booking_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  amount DECIMAL(10,2) DEFAULT 0, -- added for payment tracking
  transaction_id VARCHAR(100),    -- added for payment tracking
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (showtime_id) REFERENCES showtimes(id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_showtime_id (showtime_id)
);

CREATE TABLE tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  movie_title VARCHAR(200) NOT NULL,
  cinema_name VARCHAR(150) NOT NULL,
  seats TEXT NOT NULL, -- changed to TEXT for more seats
  show_time DATETIME NOT NULL,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY unique_booking (booking_id)
);
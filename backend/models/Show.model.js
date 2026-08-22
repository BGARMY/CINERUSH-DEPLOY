const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Adjust path if needed

const Show = sequelize.define('Show', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  movie_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  show_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  show_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  }
}, {
  tableName: 'showtimes', // Your actual table name
  timestamps: false
});

module.exports = Show;
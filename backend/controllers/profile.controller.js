const pool = require('../config/db');
const bcrypt = require('bcrypt');
const { isEmail, isStrongPassword, isNonEmptyString, sanitizeString } = require('../utils/validators');

// Get current user's profile
exports.getProfile = async (req, res) => {
  try {
    // auth middleware sets req.user.id
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const [rows] = await pool.query('SELECT id, name, email, created_at FROM users WHERE id = ?', [userId]);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update user profile (name/email) and optionally change password
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { name, email, password } = req.body;
    if (!isNonEmptyString(name) && !isNonEmptyString(email) && !isNonEmptyString(password)) {
      return res.status(400).json({ error: 'At least one of name, email or password must be provided' });
    }

    const updates = [];
    const params = [];

    if (isNonEmptyString(name)) {
      updates.push('name = ?'); params.push(sanitizeString(name));
    }
    if (isNonEmptyString(email)) {
      if (!isEmail(email)) return res.status(400).json({ error: 'Invalid email' });
      // Avoid duplicate email
      const [exists] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId]);
      if (exists.length) return res.status(409).json({ error: 'Email already in use' });
      updates.push('email = ?'); params.push(sanitizeString(email));
    }
    if (isNonEmptyString(password)) {
      if (!isStrongPassword(password)) return res.status(400).json({ error: 'Password too weak (min 6 chars)' });
      const hash = await bcrypt.hash(password, 10);
      updates.push('password = ?'); params.push(hash);
    }

    if (updates.length === 0) return res.status(400).json({ error: 'Nothing to update' });
    params.push(userId);
    const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    await pool.query(sql, params);
    res.json({ success: true, message: 'Profile updated' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
};
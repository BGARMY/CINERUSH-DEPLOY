const pool = require('../config/db');
const bcrypt = require('bcrypt');

exports.getProfile = async (req, res) => {
  try {
    // req.user expected from auth middleware; fallback to query user_id
    const userId = (req.user && req.user.id) || parseInt(req.query.user_id);
    if (!userId) return res.status(400).json({ error: 'Missing user id' });
    const [rows] = await pool.query('SELECT id, name, email, created_at FROM users WHERE id = ?', [userId]);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = (req.user && req.user.id) || parseInt(req.body.user_id);
    if (!userId) return res.status(400).json({ error: 'Missing user id' });
    const { name, email, password } = req.body;
    const updates = [];
    const params = [];
    if (name) { updates.push('name = ?'); params.push(name); }
    if (email) { updates.push('email = ?'); params.push(email); }
    if (password) { 
      const hash = await bcrypt.hash(password, 10); 
      updates.push('password = ?'); 
      params.push(hash); 
    }
    if (!updates.length) return res.status(400).json({ error: 'Nothing to update' });
    params.push(userId);
    const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    await pool.query(sql, params);
    res.json({ success: true, message: 'Profile updated' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
};
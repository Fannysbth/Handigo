const { supabase } = require('../config/supabase');

async function authenticate(req, res, next) {
  try {
    console.log('COOKIES:', req.cookies);
    const token = req.cookies.access_token;

    if (!token) {
      return res.status(401).json({ error: 'Belum login' });
    }

    const { data, error } = await supabase.auth.getUser(token);
    console.log('SUPABASE USER:', data, error);

    if (error || !data.user) {
      return res.status(401).json({ error: 'Token invalid / expired' });
    }

    req.user = data.user;
    req.accessToken = token; // 🔥 TAMBAH INI PENTING
    next();
  } catch (err) {
    console.log('AUTH ERROR:', err);
    return res.status(500).json({ error: 'Auth error' });
  }
}

module.exports = { authenticate };
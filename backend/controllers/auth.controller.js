const { supabase, supabaseAdmin } = require('../config/supabase');

/**
 * POST /api/auth/register
 * Body: { email, password, full_name }
 */
async function register(req, res, next) {
  try {
    const { email, password, full_name } = req.body;
    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Email, password, dan nama lengkap wajib diisi.' });
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    });

    if (error) return res.status(400).json({ error: error.message });

    // Buat profile
    await supabase.from('profiles').upsert({
      id: data.user.id,
      full_name,
      email,
      created_at: new Date().toISOString(),
    });

    res.status(201).json({ message: 'Registrasi berhasil.', user: data.user });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Catatan: login sebaiknya langsung dari frontend via Supabase SDK.
 * Endpoint ini untuk keperluan API eksternal / testing.
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan password wajib diisi.' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(401).json({ error: error.message });

    res.json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: data.user,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/logout
 * Header: Authorization: Bearer <token>
 */
async function logout(req, res, next) {
  try {
    const { error } = await supabase.auth.admin.signOut(req.user.id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Logout berhasil.' });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me
 * Header: Authorization: Bearer <token>
 */
async function getMe(req, res) {
  res.json({ user: req.user });
}

module.exports = { register, login, logout, getMe };
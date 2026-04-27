const supabase = require('../config/supabase');

/**
 * GET /api/profile
 */
async function getProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) return res.status(404).json({ error: 'Profil tidak ditemukan.' });
    res.json(data);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/profile
 * Body: { full_name, avatar_url, ... }
 */
async function updateProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const { full_name, avatar_url } = req.body;

    const { data, error } = await supabase
      .from('profiles')
      .update({ full_name, avatar_url, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = { getProfile, updateProfile };
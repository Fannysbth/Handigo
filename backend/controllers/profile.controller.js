const { supabase, supabaseAdmin } = require('../config/supabase');

/**
 * GET /api/profile
 */
async function getProfile(req, res, next) {
  try {
    const userId = req.user.id;

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      return res.status(500).json({
        error: 'Database error',
        detail: error.message,
      });
    }

    const safeData = {
      id: userId,
      email: req.user.email,
      full_name:
        data?.full_name ||
        req.user.user_metadata?.full_name ||   // ⚠️ FIX INI (bukan "name")
        '',
      avatar_url: data?.avatar_url || null,
      created_at: data?.created_at || null,
    };

    res.json(safeData);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/profile
 */
async function updateProfile(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized - no user'
      });
    }

    const userId = req.user.id;
    const { full_name, avatar_url, email } = req.body;

    const updatePayload = {
      updated_at: new Date().toISOString(),
    };

    if (full_name !== undefined) updatePayload.full_name = full_name;
    if (avatar_url !== undefined) updatePayload.avatar_url = avatar_url;

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updatePayload)
      .eq('id', userId)
      .select('*')
      .maybeSingle();

    if (error) {
      console.log('SUPABASE UPDATE ERROR:', error);
      return res.status(500).json({
        error: 'Failed to update profile',
        detail: error.message,
      });
    }

    return res.json(data);

  } catch (err) {
    console.log('UPDATE PROFILE CRASH:', err);
    next(err);
  }
}

module.exports = {
  getProfile,
  updateProfile,
};
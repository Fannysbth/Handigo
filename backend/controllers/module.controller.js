const supabase = require('../config/supabase');

/**
 * GET /api/modules
 * Publik — tidak perlu auth
 */
async function getModules(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .order('sort_order');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/modules/:id
 */
async function getModuleById(req, res, next) {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return res.status(404).json({ error: 'Modul tidak ditemukan.' });
    res.json(data);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/modules/:id/exercises
 */
async function getModuleExercises(req, res, next) {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('module_id', id)
      .order('sort_order');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = { getModules, getModuleById, getModuleExercises };
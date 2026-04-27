const supabase = require('../config/supabase');

/**
 * GET /api/exercises/:id
 */
async function getExerciseById(req, res, next) {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return res.status(404).json({ error: 'Latihan tidak ditemukan.' });
    res.json(data);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/exercises/:id/result
 * Body: { score, accuracy, attempts, time_seconds, module_id }
 * Simpan hasil latihan user
 */
async function saveExerciseResult(req, res, next) {
  try {
    const { id: exerciseId } = req.params;
    const userId = req.user.id;
    const { score, accuracy, attempts, time_seconds, module_id } = req.body;

    if (!module_id || score == null || accuracy == null) {
      return res.status(400).json({ error: 'module_id, score, dan accuracy wajib diisi.' });
    }

    const { data, error } = await supabase
      .from('exercise_results')
      .insert({
        user_id: userId,
        module_id,
        exercise_id: exerciseId,
        score,
        accuracy,
        attempts: attempts || 1,
        time_seconds: time_seconds || 0,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/exercises/results
 * Ambil semua hasil latihan user (history)
 */
async function getUserResults(req, res, next) {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;

    const { data, error } = await supabase
      .from('exercise_results')
      .select('*, modules(title), exercises(title)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    next(err);
  }
}

module.exports = { getExerciseById, saveExerciseResult, getUserResults };
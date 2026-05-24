const { supabaseAdmin } = require('../config/supabase');

/**
 * GET /api/exercises/:id
 */
async function getExerciseById(req, res, next) {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('exercises')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Latihan tidak ditemukan.' });
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/exercises/:id/result
 */
async function saveExerciseResult(req, res, next) {
  try {
    const { id: exerciseId } = req.params;
    const userId = req.user.id;

    const { score, accuracy, attempts, time_seconds, module_id } = req.body;

    if (!module_id || score == null || accuracy == null) {
      return res.status(400).json({
        error: 'module_id, score, dan accuracy wajib diisi.',
      });
    }

    const { data, error } = await supabaseAdmin
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
 */
async function getUserResults(req, res, next) {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;

    const { data, error } = await supabaseAdmin
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

/**
 * GET /api/exercises/results/latest
 */
async function getLatestResult(req, res, next) {
  try {
    const userId = req.user.id;

    const { data, error } = await supabaseAdmin
      .from('exercise_results')
      .select(`
        *,
        exercises(title, sort_order),
        modules(title)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        error: 'Belum ada hasil latihan.',
      });
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/exercises/results/latest/next
 * FIXED VERSION
 */
async function getLatestResultAndRecommendedNext(req, res, next) {
  try {
    const userId = req.user.id;

    // 1. ambil latest result
    const { data: latest, error: e1 } = await supabaseAdmin
      .from('exercise_results')
      .select(`
        *,
        exercises(id, title, sort_order, module_id),
        modules(id, title)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (e1) throw e1;

    if (!latest) {
      return res.status(404).json({ error: 'Belum ada hasil latihan.' });
    }

    const moduleId = latest.module_id;
    const latestExerciseId = latest.exercises?.id;

    // 2. ambil SEMUA latihan dalam modul
    const { data: allExercises, error: e2 } = await supabaseAdmin
      .from('exercises')
      .select('id, title, sort_order')
      .eq('module_id', moduleId)
      .order('sort_order', { ascending: true });

    if (e2) throw e2;

    // 3. ❗ BUANG hanya 1 latihan terakhir yang selesai
    const nextExercises = (allExercises || []).filter(
      ex => ex.id !== latestExerciseId
    );

    res.json({
      latest,
      nextExercises,
      meta: {
        moduleId,
        latestExerciseId,
        mode: 'all-minus-latest',
      },
    });

  } catch (err) {
    next(err);
  }
}
module.exports = {
  getExerciseById,
  saveExerciseResult,
  getUserResults,
  getLatestResult,
  getLatestResultAndRecommendedNext,
};
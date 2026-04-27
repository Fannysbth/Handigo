const supabase = require('../config/supabase');

/**
 * GET /api/progress
 * Ambil semua progress user untuk semua modul
 */
async function getAllProgress(req, res, next) {
  try {
    const userId = req.user.id;
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/progress/:moduleId
 * Ambil progress user untuk 1 modul
 */
async function getModuleProgress(req, res, next) {
  try {
    const userId = req.user.id;
    const { moduleId } = req.params;

    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('module_id', moduleId)
      .maybeSingle();

    if (error) throw error;
    res.json(data || null);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/progress/:moduleId
 * Upsert progress — tidak pernah mundur
 * Body: { completed_exercises, progress_percentage, last_exercise_index }
 */
async function upsertModuleProgress(req, res, next) {
  try {
    const userId = req.user.id;
    const { moduleId } = req.params;
    const { completed_exercises, progress_percentage, last_exercise_index } = req.body;

    // Ambil progress lama dulu — jangan sampai mundur
    const { data: existing } = await supabase
      .from('user_progress')
      .select('completed_exercises, progress_percentage, last_exercise_index')
      .eq('user_id', userId)
      .eq('module_id', moduleId)
      .maybeSingle();

    const safeCompleted = Math.max(
      existing?.completed_exercises || 0,
      completed_exercises || 0
    );
    const safePct = Math.max(
      existing?.progress_percentage || 0,
      progress_percentage || 0
    );
    const safeLastIndex = Math.max(
      existing?.last_exercise_index || 0,
      last_exercise_index || 0
    );

    const { data, error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        module_id: moduleId,
        completed_exercises: safeCompleted,
        progress_percentage: safePct,
        last_exercise_index: safeLastIndex,
        last_accessed_at: new Date().toISOString(),
      }, { onConflict: 'user_id,module_id' })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/progress/last-accessed
 * Modul terakhir yang diakses user
 */
async function getLastAccessed(req, res, next) {
  try {
    const userId = req.user.id;
    const { data, error } = await supabase
      .from('user_progress')
      .select('*, modules(*)')
      .eq('user_id', userId)
      .order('last_accessed_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    res.json(data || null);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/progress/dashboard
 * Stats untuk halaman dashboard
 */
async function getDashboardStats(req, res, next) {
  try {
    const userId = req.user.id;

    const [{ data: progress, error: pErr }, { data: results, error: rErr }] = await Promise.all([
      supabase.from('user_progress').select('*').eq('user_id', userId),
      supabase.from('exercise_results').select('accuracy, created_at').eq('user_id', userId).order('created_at', { ascending: false }),
    ]);

    if (pErr) throw pErr;
    if (rErr) throw rErr;

    const completedModules = (progress || []).filter(p => p.progress_percentage >= 100).length;

    const accuracies = (results || []).map(r => r.accuracy).filter(Boolean);
    const avgAccuracy = accuracies.length > 0
      ? Math.round(accuracies.reduce((a, b) => a + b, 0) / accuracies.length)
      : 0;

    // Hitung streak hari berturut-turut
    const daySet = new Set((results || []).map(r =>
      new Date(r.created_at).toISOString().split('T')[0]
    ));
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      if (daySet.has(key)) streak++;
      else if (i > 0) break;
    }

    // Chart mingguan (7 hari terakhir)
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekData = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const key = d.toISOString().split('T')[0];
      const dayResults = (results || []).filter(r =>
        new Date(r.created_at).toISOString().split('T')[0] === key
      );
      const dayAvg = dayResults.length > 0
        ? Math.round(dayResults.reduce((a, r) => a + (r.accuracy || 0), 0) / dayResults.length)
        : 0;
      return { day: dayNames[d.getDay()], accuracy: dayAvg };
    });

    res.json({
      completedModules,
      avgAccuracy,
      streak,
      weekData,
      totalResults: (results || []).length,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllProgress,
  getModuleProgress,
  upsertModuleProgress,
  getLastAccessed,
  getDashboardStats,
};
const { supabase, supabaseAdmin } = require('../config/supabase');
/**
 * @swagger
 * /api/exercises/{id}:
 *   get:
 *     summary: Ambil detail latihan berdasarkan ID
 *     tags: [Exercises]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID exercise
 *     responses:
 *       200:
 *         description: Data latihan ditemukan
 *         content:
 *           application/json:
 *             example:
 *               id: ex_123
 *               title: Belajar Huruf A
 *               description: Latihan mengenal huruf A
 *       404:
 *         description: Latihan tidak ditemukan
 *         content:
 *           application/json:
 *             example:
 *               error: Latihan tidak ditemukan.
 */

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
    
    if (error) return res.status(404).json({ error: 'Latihan tidak ditemukan.' });
    res.json(data);
  } catch (err) {
    next(err);
  }
}

/**
 * @swagger
 * /api/exercises/{id}/result:
 *   post:
 *     summary: Simpan hasil latihan user
 *     tags: [Exercises]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID exercise
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - module_id
 *               - score
 *               - accuracy
 *             properties:
 *               module_id:
 *                 type: string
 *                 example: mod_123
 *               score:
 *                 type: number
 *                 example: 85
 *               accuracy:
 *                 type: number
 *                 example: 90
 *               attempts:
 *                 type: number
 *                 example: 1
 *               time_seconds:
 *                 type: number
 *                 example: 30
 *     responses:
 *       201:
 *         description: Hasil latihan berhasil disimpan
 *         content:
 *           application/json:
 *             example:
 *               id: res_123
 *               user_id: user_1
 *               module_id: mod_123
 *               exercise_id: ex_123
 *               score: 85
 *               accuracy: 90
 *               attempts: 1
 *               time_seconds: 30
 *       400:
 *         description: Input tidak valid
 *         content:
 *           application/json:
 *             example:
 *               error: module_id, score, dan accuracy wajib diisi.
 */
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
 * @swagger
 * /api/exercises/results:
 *   get:
 *     summary: Ambil riwayat hasil latihan user
 *     tags: [Exercises]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: number
 *         description: Jumlah data yang diambil (default 20)
 *     responses:
 *       200:
 *         description: List hasil latihan user
 *         content:
 *           application/json:
 *             example:
 *               - id: res_123
 *                 score: 85
 *                 accuracy: 90
 *                 created_at: 2026-01-01T10:00:00Z
 *                 modules:
 *                   title: Modul Dasar
 *                 exercises:
 *                   title: Huruf A
 */
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

/**
 * GET /api/exercises/results/latest
 */
async function getLatestResult(req, res, next) {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('exercise_results')
      .select(`
        *,
        exercises(title),
        modules(title)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      return res.status(404).json({
        error: 'Belum ada hasil latihan.',
      });
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = { getExerciseById, saveExerciseResult, getUserResults, getLatestResult };
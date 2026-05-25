
const { supabase, supabaseAdmin } = require('../config/supabase');
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register user baru
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - full_name
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@mail.com
 *               password:
 *                 type: string
 *                 example: 12345678
 *               full_name:
 *                 type: string
 *                 example: Budi Santoso
 *     responses:
 *       201:
 *         description: Register berhasil
 *       400:
 *         description: Error input
 */

/**
 * POST /api/auth/register
 * Register user baru (Supabase Admin)
 * Body: { email, password, full_name }
 */
async function register(req, res, next) {
  try {
    const { email, password, full_name } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Semua field wajib diisi' });
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name, // 🔥 SATU SUMBER
      },
    });

    if (error) return res.status(400).json({ error: error.message });

    // 🔥 AUTO CREATE PROFILE (SOURCE OF TRUTH)
    const full_name_final =
  full_name ||
  data.user.user_metadata?.full_name ||
  data.user.user_metadata?.name ||
  'User';

await supabase.from('profiles').upsert({
  id: data.user.id,
  email,
  full_name: full_name,   // wajib
  avatar_url: null,
}, { onConflict: 'id' });
console.log('PROFILE UPSERT DONE FOR', data.user.id);

    return res.status(201).json({
      message: 'Register berhasil',
      user: data.user,
    });

  } catch (err) {
    next(err);
  }
}

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login sukses
 *       401:
 *         description: Unauthorized
 */

/**
 * POST /api/auth/login
 * Login user menggunakan email & password
 * Body: { email, password }
 * Catatan: login sebaiknya langsung dari frontend via Supabase SDK.
 * Endpoint ini untuk keperluan API eksternal / testing.
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) return res.status(401).json({ error: error.message });

    res.cookie('access_token', data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      message: 'Login sukses',
      user: data.user
    });

  } catch (err) {
    next(err);
  }
}

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout sukses
 */
/**
 * POST /api/auth/logout
 * Logout via cookie
 */
async function logout(req, res) {
  res.clearCookie('access_token');
  res.json({ message: 'Logout sukses' });
}

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     summary: Login dengan Google
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               credential:
 *                 type: string
 *     responses:
 *       200:
 *         description: Response Google login
 */
/**
 * POST /api/auth/google
 * Login / cek user Google OAuth
 * Body: { credential }
 */
async function googleLogin(req, res) {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: "Credential tidak ditemukan" });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const email = payload.email;
    const full_name = payload.name;
    const avatar_url = payload.picture;

    // 🔥 1. cek profile dulu
    let { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    // 🔥 2. kalau belum ada → suruh buat profile
    if (!profile) {
      return res.json({
        needProfile: true,
        email,
        full_name,
        avatar_url,
      });
    }

    // 🔥 3. kalau ada → buat session Supabase agar cookie ter-set
    // FE sebelumnya mengandalkan /auth/me, jadi /auth/google harus set cookie juga.
    const { data: loginData, error: loginError } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: credential,
    });

    if (loginError || !loginData?.session) {
      return res.status(401).json({
        error: 'Gagal membuat session dari Google',
        detail: loginError?.message || 'Missing session',
      });
    }

    res.cookie('access_token', loginData.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      needProfile: false,
      user: profile,
    });

  } catch (err) {
    return res.status(401).json({
      error: "Google token invalid",
      detail: err.message,
    });
  }
}

/**
 * @swagger
 * /api/auth/complete-profile:
 *   post:
 *     summary: Lengkapi profile user Google
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, full_name]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               full_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile berhasil dilengkapi
 */
/**
 * POST /api/auth/complete-profile
 * Melengkapi akun setelah login Google
 * Body: { email, password, full_name }
 */
async function completeProfile(req, res) {
  try {
    const { email, full_name, password } = req.body;

    if (!email || !full_name || !password) {
      return res.status(400).json({
        error: "Data tidak lengkap"
      });
    }

    // 1. cari user (SUDAH ADA DI AUTH)
    const { data: users } =
      await supabaseAdmin.auth.admin.listUsers();

    const user = users.users.find(u => u.email === email);

    if (!user) {
      return res.status(400).json({
        error: "User Google belum ada di Auth (harus login dulu)"
      });
    }

    // 2. UPDATE → ini pengganti "register"
    const { error: updateError } =
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        password,
        user_metadata: {
          full_name
        }
      });

    if (updateError) {
      return res.status(500).json({
        error: updateError.message
      });
    }

    // 3. upsert profile
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        email,
        full_name
      });

    if (profileError) {
      return res.status(500).json({
        error: "Gagal simpan profile",
        detail: profileError
      });
    }

    // Setelah lengkap profile, lakukan login pakai email/password agar cookie ter-set
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      return res.status(500).json({
        error: loginError.message || 'Gagal login setelah complete profile',
      });
    }

    res.cookie('access_token', loginData.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: "Registrasi via Google selesai (password dibuat dan login otomatis)"
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
}

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Ambil data user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Data user
 */
/**
 * GET /api/auth/me
 * Mengambil data user dari middleware auth (JWT/cookie)
 */
async function getMe(req, res) {
  res.json({ user: req.user });
}

module.exports = { 
  register, 
  login, 
  logout, 
  getMe,
  googleLogin,
  completeProfile
};

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: API Authentication
 */

const { supabase, supabaseAdmin } = require('../config/supabase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
 * Register user baru (Custom Table Auth)
 * Body: { email, password, full_name }
 */
async function register(req, res, next) {
  try {
    const { email, password, full_name } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Semua field wajib diisi' });
    }

    // 1. Cek apakah email sudah terdaftar
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    if (checkError) {
      return res.status(500).json({
        error: 'Gagal cek database',
        detail: checkError.message
      });
    }

    if (existingUser) {
      return res.status(400).json({
        error: 'Email sudah terdaftar'
      });
    }

    // 2. Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 3. Insert profile baru
    const { data: newProfile, error: insertError } = await supabaseAdmin
      .from('profiles')
      .insert([
        {
          email,
          password: hashedPassword,
          full_name,
          avatar_url: null
        }
      ])
      .select()
      .single();

    if (insertError) {
      return res.status(500).json({
        error: 'Gagal membuat user baru',
        detail: insertError.message
      });
    }

    return res.status(201).json({
      message: 'Register berhasil',
      user: {
        id: newProfile.id,
        email: newProfile.email,
        full_name: newProfile.full_name
      }
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
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@mail.com
 *               password:
 *                 type: string
 *                 example: 12345678
 *     responses:
 *       200:
 *         description: Login sukses
 *       401:
 *         description: Unauthorized
 */

/**
 * POST /api/auth/login
 * Login user menggunakan email & password
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email dan password wajib diisi'
      });
    }

    // 1. Cari user
    const { data: profile, error: selectError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (selectError || !profile) {
      return res.status(401).json({
        error: 'Email atau password salah'
      });
    }

    // 2. Validasi akun Google
    if (!profile.password) {
      return res.status(400).json({
        error: 'Akun ini terdaftar menggunakan Google. Silakan login lewat Google.'
      });
    }

    // 3. Compare password
    const isPasswordValid = await bcrypt.compare(
      password,
      profile.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Email atau password salah'
      });
    }

    // 4. Generate JWT
    const myAccessToken = jwt.sign(
      {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d'
      }
    );

    // 5. Save cookie
    res.cookie('access_token', myAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({
      message: 'Login sukses',
      user: {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url
      }
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
 * Logout user
 */
async function logout(req, res) {
  res.clearCookie('access_token');

  res.json({
    message: 'Logout sukses'
  });
}

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
 *             required:
 *               - credential
 *             properties:
 *               credential:
 *                 type: string
 *                 example: eyJhbGciOiJSUzI1NiIs...
 *     responses:
 *       200:
 *         description: Login Google sukses
 */

/**
 * POST /api/auth/google
 * Login / Register Google OAuth
 */
async function googleLogin(req, res) {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        error: 'Credential tidak ditemukan'
      });
    }

    // VERIFY GOOGLE TOKEN
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    const email = payload.email;
    const full_name = payload.name;
    const avatar_url = payload.picture;

    // CEK USER
    let { data: profile, error: selectError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (selectError) {
      return res.status(500).json({
        error: 'Gagal cek database',
        detail: selectError.message
      });
    }

    let needProfile = false;

    // =========================
    // USER BARU
    // =========================
    if (!profile) {
      const { data: newProfile, error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert([
          {
            email,
            full_name,
            avatar_url,
            password: null
          }
        ])
        .select()
        .single();

      if (insertError) {
        return res.status(500).json({
          error: 'Gagal membuat profile baru',
          detail: insertError.message
        });
      }

      profile = newProfile;

      // user baru wajib complete profile
      needProfile = true;
    }

    // =========================
    // UPDATE PROFILE
    // =========================
    else {
      const { data: updatedProfile } = await supabaseAdmin
        .from('profiles')
        .update({
          full_name,
          avatar_url
        })
        .eq('email', email)
        .select()
        .single();

      if (updatedProfile) {
        profile = updatedProfile;
      }

      // kalau belum punya password
      if (!profile.password) {
        needProfile = true;
      }
    }

    // =========================
    // JWT
    // =========================
    const myAccessToken = jwt.sign(
      {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d'
      }
    );

    // COOKIE
    res.cookie('access_token', myAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({
      message: 'Login Google sukses',

      needProfile,

      user: {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url
      }
    });

  } catch (err) {
    return res.status(401).json({
      error: 'Google token invalid atau kadaluarsa',
      detail: err.message
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
 *             required:
 *               - email
 *               - full_name
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@mail.com
 *               full_name:
 *                 type: string
 *                 example: Budi Santoso
 *               password:
 *                 type: string
 *                 example: 12345678
 *     responses:
 *       200:
 *         description: Profile berhasil dilengkapi
 */

/**
 * POST /api/auth/complete-profile
 * Lengkapi akun Google dengan password
 */
async function completeProfile(req, res) {
  try {
    const { email, full_name, password } = req.body;

    if (!email || !full_name || !password) {
      return res.status(400).json({
        error: 'Data tidak lengkap'
      });
    }

    // 1. Cari profile
    const { data: profile, error: selectError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (selectError) {
      return res.status(500).json({
        error: 'Gagal membaca database'
      });
    }

    if (!profile) {
      return res.status(400).json({
        error: 'User belum terdaftar. Login Google terlebih dahulu.'
      });
    }

    // 2. Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 3. Update profile
    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        password: hashedPassword,
        full_name
      })
      .eq('email', email)
      .select()
      .single();

    if (updateError) {
      return res.status(500).json({
        error: 'Gagal menyimpan data',
        detail: updateError.message
      });
    }

    // 4. Generate JWT
    const myAccessToken = jwt.sign(
      {
        id: updatedProfile.id,
        email: updatedProfile.email,
        full_name: updatedProfile.full_name
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d'
      }
    );

    // 5. Save cookie
    res.cookie('access_token', myAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({
      message: 'Registrasi Google selesai',
      user: {
        id: updatedProfile.id,
        email: updatedProfile.email,
        full_name: updatedProfile.full_name
      }
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
 *     summary: Ambil data user login
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Data user berhasil diambil
 */

/**
 * GET /api/auth/me
 * Ambil data user dari JWT middleware
 */
async function getMe(req, res) {
  res.json({
    user: req.user
  });
}

module.exports = {
  register,
  login,
  logout,
  getMe,
  googleLogin,
  completeProfile
};
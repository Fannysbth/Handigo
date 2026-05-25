require('dotenv').config();
console.log('ENV CHECK:', {
  url: process.env.SUPABASE_URL,
  key: process.env.SUPABASE_SERVICE_ROLE_KEY,
});
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const moduleRoutes = require('./routes/module.routes');
const progressRoutes = require('./routes/progress.routes');
const exerciseRoutes = require('./routes/exercise.routes');
const profileRoutes = require('./routes/profile.routes');
const detectionRoutes = require('./routes/detection.routes');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');



const app = express();
console.log('authRoutes:', typeof authRoutes);
console.log('moduleRoutes:', typeof moduleRoutes);
console.log('progressRoutes:', typeof progressRoutes);
console.log('exerciseRoutes:', typeof exerciseRoutes);
console.log('profileRoutes:', typeof profileRoutes);
console.log('detectionRoutes:', typeof detectionRoutes);
app.use(express.json());

const allowedOrigins = [
  'http://localhost:5173', // Untuk kamu ngoding di lokal
  'https://agreeable-forest-004905c00.7.azurestaticapps.net' ,
  'htps://handigo-five.vercel.app'// Untuk production
];

app.use(cors({
  origin: function (origin, callback) {
    // Izinkan request tanpa origin (seperti Postman atau mobile apps)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy'));
    }
  },
  credentials: true
}));
app.use(cookieParser());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/detection', detectionRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',

    info: {
      title: 'Auth API',
      version: '1.0.0',
      description: 'Dokumentasi API Auth dengan Supabase',
    },

    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],

    // ⬇️ TAMBAH DI SINI
    tags: [
      {
        name: 'Auth',
        description: 'Authentication API',
      },
      {
        name: 'Detection',
        description: 'AI Detection API',
      },
       { 
        name: 'Exercises', 
        description: 'Exercise & Results API' 
        },
        { name: 'Modules', description: 'Module API' },
        { name: 'Profile', description: 'User Profile API' },
        { name: 'Progress', description: 'User Progress & Analytics API' },
    ],

    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'access_token',
        },
      },
    },

    security: [
      {
        cookieAuth: [],
      },
    ],
  },

  apis: ['./routes/*.js', './controllers/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
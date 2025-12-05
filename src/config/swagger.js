const swaggerJsdoc = require('swagger-jsdoc');

// Determine API server URL based on environment
const getServerUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.API_URL || 'https://digischool-api.onrender.com';
  }
  return process.env.API_URL || 'http://localhost:3000';
};

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DigiSchool API',
      version: '1.0.0',
      description: 'REST API for school management system',
      contact: {
        name: 'DigiSchool Team',
        email: 'team@digischool.com'
      }
    },
    servers: [
      {
        url: getServerUrl(),
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./src/routes/*.js', './src/models/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

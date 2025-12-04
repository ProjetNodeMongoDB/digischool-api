const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

/**
 * @swagger
 * tags:
 *   name: Health
 *   description: Health check and monitoring endpoints for Docker/Kubernetes orchestration
 */

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Combined health check (liveness + readiness)
 *     description: Returns overall health status including application liveness and readiness. Used for monitoring and alerting.
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: API is healthy and ready
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-12-04T10:30:00.000Z
 *                 uptime:
 *                   type: number
 *                   description: Server uptime in seconds
 *                   example: 3600
 *                 checks:
 *                   type: object
 *                   properties:
 *                     live:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: alive
 *                     ready:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: ready
 *                         mongodb:
 *                           type: string
 *                           example: connected
 *       503:
 *         description: API is unhealthy or not ready
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: unhealthy
 *                 error:
 *                   type: string
 *                   example: Database not connected
 */
router.get('/', async (req, res) => {
  try {
    // Check MongoDB connection for readiness
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        status: 'unhealthy',
        error: 'Database not connected',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        checks: {
          live: { status: 'alive' },
          ready: { status: 'not ready', mongodb: 'disconnected' }
        }
      });
    }

    // Ping database to verify connection
    await mongoose.connection.db.admin().ping();

    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        live: { status: 'alive' },
        ready: { status: 'ready', mongodb: 'connected' }
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: 'Health check failed',
      details: error.message,
      timestamp: new Date().toISOString(),
      checks: {
        live: { status: 'alive' },
        ready: { status: 'not ready', error: error.message }
      }
    });
  }
});

/**
 * @swagger
 * /health/live:
 *   get:
 *     summary: Liveness probe
 *     description: Simple check to verify the application process is running. Used by Docker/Kubernetes to determine if the container should be restarted. Does not check external dependencies.
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Application is alive
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: alive
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-12-04T10:30:00.000Z
 */
router.get('/live', (req, res) => {
  // Liveness probe - just check if the app is running
  // No database checks - we don't want to restart the container if DB is temporarily down
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString()
  });
});

/**
 * @swagger
 * /health/ready:
 *   get:
 *     summary: Readiness probe
 *     description: Checks if the application is ready to accept traffic. Verifies MongoDB connectivity and other critical dependencies. Used by Docker/Kubernetes to determine if traffic should be routed to this instance.
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Application is ready to accept traffic
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ready
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-12-04T10:30:00.000Z
 *                 mongodb:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: connected
 *                     readyState:
 *                       type: number
 *                       example: 1
 *       503:
 *         description: Application is not ready to accept traffic
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: not ready
 *                 error:
 *                   type: string
 *                   example: Database not connected
 */
router.get('/ready', async (req, res) => {
  try {
    // Readiness probe - check if we can serve traffic
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        status: 'not ready',
        error: 'Database not connected',
        timestamp: new Date().toISOString(),
        mongodb: {
          status: 'disconnected',
          readyState: mongoose.connection.readyState
        }
      });
    }

    // Ping database to verify connection
    await mongoose.connection.db.admin().ping();

    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      mongodb: {
        status: 'connected',
        readyState: mongoose.connection.readyState
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      error: 'Database connection failed',
      details: error.message,
      timestamp: new Date().toISOString(),
      mongodb: {
        status: 'error',
        error: error.message
      }
    });
  }
});

module.exports = router;

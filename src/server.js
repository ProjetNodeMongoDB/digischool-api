require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');

// Connect to database
connectDB();

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

/**
 * Global Error Handlers for Unhandled Errors
 *
 * These handlers are the last line of defense against crashes in production.
 * They catch errors that slip through try/catch blocks and Express error middleware.
 */

/**
 * Handle Unhandled Promise Rejections
 *
 * Why this is critical:
 * - Async code (await/promises) can fail outside try/catch blocks
 * - Example: Database connection drops, third-party API timeout, malformed async code
 * - Without this handler, Node.js 15+ will crash the entire process
 * - Catches: forgotten await, uncaught .then() chains, async middleware failures
 *
 * What it does:
 * - Logs the error with full context (reason, origin, promise details)
 * - Gracefully closes the server to stop accepting new requests
 * - Exits process after cleanup (allows Docker/PM2 to restart the app)
 *
 * Best practice:
 * - This is a safety net, NOT a replacement for proper error handling
 * - Always use try/catch in async/await code and .catch() on promises
 * - Log these errors to monitoring tools (Sentry, LogRocket, etc.) in production
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ UNHANDLED PROMISE REJECTION! Shutting down gracefully...');
  console.error('Reason:', reason);
  console.error('Promise:', promise);

  // Close server gracefully (finish pending requests)
  server.close(() => {
    console.error('💥 Process terminated due to unhandled promise rejection');
    process.exit(1);
  });
});

/**
 * Handle Uncaught Exceptions
 *
 * Why this is critical:
 * - Synchronous code errors that aren't caught anywhere (rare but catastrophic)
 * - Example: undefined variable access, null reference, syntax errors in dynamic code
 * - Without this handler, Node.js crashes immediately with no cleanup
 * - Catches: typos in variable names, accessing properties of undefined, division errors
 *
 * What it does:
 * - Logs the full error stack trace for debugging
 * - Immediately exits the process (app state is likely corrupted)
 * - No graceful shutdown (uncaught exceptions leave app in undefined state)
 *
 * Best practice:
 * - This should RARELY fire in production (indicates a serious bug)
 * - Fix the root cause immediately - don't rely on this as error handling
 * - Use linters (ESLint) and TypeScript to catch these at development time
 * - Monitor these errors - they indicate critical bugs in your codebase
 */
process.on('uncaughtException', (error) => {
  console.error('❌ UNCAUGHT EXCEPTION! Shutting down immediately...');
  console.error('Error:', error.name);
  console.error('Message:', error.message);
  console.error('Stack:', error.stack);

  // Exit immediately (app state is corrupted)
  console.error('💥 Process terminated due to uncaught exception');
  process.exit(1);
});

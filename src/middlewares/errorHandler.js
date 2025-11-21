const errorHandler = (err, req, res, next) => {
    // Structured error logging for Docker Compose visibility
    const timestamp = new Date().toISOString();
    const logPrefix = `[${timestamp}] [ERROR]`;

    console.error(`${logPrefix} ========================================`);
    console.error(`${logPrefix} Request: ${req.method} ${req.path}`);
    console.error(`${logPrefix} Error Type: ${err.name || 'Unknown'}`);
    console.error(`${logPrefix} Error Message: ${err.message}`);

    // Log stack trace in development mode or for critical errors
    if (process.env.NODE_ENV === 'development' || err.statusCode >= 500) {
        console.error(`${logPrefix} Stack Trace:`);
        console.error(err.stack);
    }

    console.error(`${logPrefix} ========================================`);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            success: false,
            error: 'Validation Error',
            details: errors,
        });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        return res.status(400).json({
            success: false,
            error: 'Duplicate field value entered',
        });
    }

    // Mongoose cast error (invalid ObjectId)
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            error: 'Invalid ID format',
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            error: 'Invalid token',
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            error: 'Token expired',
        });
    }

    // Default error
    res.status(err.statusCode || 500).json({
        success: false,
        error: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

module.exports = errorHandler;
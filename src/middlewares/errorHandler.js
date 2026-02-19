import { sendError } from '../utils/helpers.js';

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.message);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map((e) => e.message);
        return sendError(res, 400, 'Validation failed', errors);
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return sendError(res, 400, `${field} already exists`);
    }

    // Mongoose cast error (invalid ID)
    if (err.name === 'CastError') {
        return sendError(res, 400, 'Invalid ID format');
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return sendError(res, 401, 'Invalid token');
    }

    if (err.name === 'TokenExpiredError') {
        return sendError(res, 401, 'Token expired');
    }

    // Multer errors
    if (err.name === 'MulterError') {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return sendError(res, 400, 'File too large. Maximum size is 5MB.');
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return sendError(res, 400, 'Too many files. Maximum is 5.');
        }
        return sendError(res, 400, err.message);
    }

    // Default error -- hide internal details in production
    const statusCode = err.statusCode || 500;
    const message =
        process.env.NODE_ENV === 'production' && statusCode === 500
            ? 'Internal server error'
            : err.message || 'Internal server error';

    return sendError(res, statusCode, message);
};

export default errorHandler;

import { verifyToken } from '../utils/generateToken.js';
import User from '../models/User.js';
import { sendError } from '../utils/helpers.js';

/**
 * Protect routes - Check if user is authenticated
 */
export const protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return sendError(
                res,
                401,
                'Not authorized to access this route. Please login.'
            );
        }

        try {
            // Verify token
            const decoded = verifyToken(token);

            // Get user from token
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return sendError(res, 401, 'User not found. Please login again.');
            }

            next();
        } catch (error) {
            return sendError(res, 401, 'Invalid or expired token. Please login again.');
        }
    } catch (error) {
        return sendError(res, 500, 'Authentication error');
    }
};

/**
 * Check if user is admin
 */
export const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return sendError(
            res,
            403,
            'Access denied. Admin privileges required.'
        );
    }
};

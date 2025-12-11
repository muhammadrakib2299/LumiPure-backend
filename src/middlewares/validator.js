import { validationResult } from 'express-validator';
import { sendError } from '../utils/helpers.js';

/**
 * Validate request based on express-validator rules
 */
export const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((error) => error.msg);
        return sendError(res, 400, 'Validation failed', errorMessages);
    }

    next();
};

// User Roles
export const USER_ROLES = {
    CUSTOMER: 'customer',
    ADMIN: 'admin',
};

// Order Status
export const ORDER_STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
};

// Payment Status
export const PAYMENT_STATUS = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded',
};

// Payment Methods
export const PAYMENT_METHODS = {
    CARD: 'card',
    PAYPAL: 'paypal',
    CASH_ON_DELIVERY: 'cod',
};

// Product Categories (can be modified based on beauty products)
export const PRODUCT_CATEGORIES = [
    'Skincare',
    'Makeup',
    'Haircare',
    'Fragrance',
    'Body Care',
    'Tools & Accessories',
    'Gift Sets',
];

// API Response Messages
export const MESSAGES = {
    SUCCESS: 'Operation successful',
    ERROR: 'An error occurred',
    UNAUTHORIZED: 'Unauthorized access',
    NOT_FOUND: 'Resource not found',
    VALIDATION_ERROR: 'Validation failed',
    SERVER_ERROR: 'Internal server error',
};

// Pagination
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 12,
    MAX_LIMIT: 100,
};

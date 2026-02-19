import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import errorHandler from './middlewares/errorHandler.js';
import { sendError } from './utils/helpers.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import heroRoutes from './routes/heroRoutes.js';

// Load env variables
dotenv.config();

// Connect to database
connectDB();

// Initialize express app
const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));

// Body parsing with size limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 requests per window
    message: { success: false, message: 'Too many attempts, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'LumiPure API is running', timestamp: new Date().toISOString() });
});

// Routes
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to LumiPure API',
        version: '1.0.0',
    });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/hero', heroRoutes);

// 404 handler for unknown routes
app.use((req, res) => {
    sendError(res, 404, `Route ${req.originalUrl} not found`);
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
    console.log(`${signal} received. Shutting down gracefully...`);
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
    // Force exit after 10 seconds
    setTimeout(() => {
        console.log('Forcing shutdown...');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

const express = require('express');
const router = express.Router();

// Import separate route files
const authRoutes = require('./auth.routes');
// const productRoutes = require('./product.routes');

router.use('/auth', authRoutes);
// router.use('/products', productRoutes);

router.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'LumiPure Backend is running' });
});

module.exports = router;

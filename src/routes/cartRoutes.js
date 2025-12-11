import express from 'express';
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
} from '../controllers/cartController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', protect, getCart);
router.post('/items', protect, addToCart);
router.put('/items/:productId', protect, updateCartItem);
router.delete('/items/:productId', protect, removeFromCart);
router.delete('/', protect, clearCart);

export default router;

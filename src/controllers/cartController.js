import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { sendSuccess, sendError } from '../utils/helpers.js';

/**
 * @route   GET /api/cart
 * @desc    Get user cart
 * @access  Private
 */
export const getCart = async (req, res, next) => {
    try {
        let cart = await Cart.findOne({ user: req.user.id }).populate({
            path: 'items.product',
            select: 'name price images stock',
        });

        if (!cart) {
            cart = await Cart.create({ user: req.user.id, items: [] });
        }

        sendSuccess(res, 200, 'Cart retrieved successfully', { cart });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/cart/items
 * @desc    Add item to cart
 * @access  Private
 */
export const addToCart = async (req, res, next) => {
    try {
        const { productId, quantity = 1, selectedVariant } = req.body;

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return sendError(res, 404, 'Product not found');
        }

        if (product.stock < quantity) {
            return sendError(res, 400, 'Insufficient stock');
        }

        let cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            cart = await Cart.create({ user: req.user.id, items: [] });
        }

        // Check if item already exists in cart
        const existingItemIndex = cart.items.findIndex(
            (item) => item.product.toString() === productId
        );

        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            cart.items.push({
                product: productId,
                quantity,
                selectedVariant,
                price: product.price,
            });
        }

        await cart.save();

        cart = await cart.populate({
            path: 'items.product',
            select: 'name price images stock',
        });

        sendSuccess(res, 200, 'Item added to cart successfully', { cart });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   PUT /api/cart/items/:productId
 * @desc    Update cart item quantity
 * @access  Private
 */
export const updateCartItem = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        const cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            return sendError(res, 404, 'Cart not found');
        }

        const itemIndex = cart.items.findIndex(
            (item) => item.product.toString() === productId
        );

        if (itemIndex === -1) {
            return sendError(res, 404, 'Item not found in cart');
        }

        cart.items[itemIndex].quantity = quantity;
        await cart.save();

        await cart.populate({
            path: 'items.product',
            select: 'name price images stock',
        });

        sendSuccess(res, 200, 'Cart updated successfully', { cart });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   DELETE /api/cart/items/:productId
 * @desc    Remove item from cart
 * @access  Private
 */
export const removeFromCart = async (req, res, next) => {
    try {
        const { productId } = req.params;

        const cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            return sendError(res, 404, 'Cart not found');
        }

        cart.items = cart.items.filter(
            (item) => item.product.toString() !== productId
        );

        await cart.save();

        await cart.populate({
            path: 'items.product',
            select: 'name price images stock',
        });

        sendSuccess(res, 200, 'Item removed from cart successfully', { cart });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   DELETE /api/cart
 * @desc    Clear cart
 * @access  Private
 */
export const clearCart = async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            return sendError(res, 404, 'Cart not found');
        }

        cart.items = [];
        await cart.save();

        sendSuccess(res, 200, 'Cart cleared successfully', { cart });
    } catch (error) {
        next(error);
    }
};

import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { sendSuccess, sendError, getPagination, buildPaginationMeta } from '../utils/helpers.js';
import { ORDER_STATUS } from '../config/constants.js';

/**
 * @route   POST /api/orders
 * @desc    Create new order
 * @access  Private
 */
export const createOrder = async (req, res, next) => {
    try {
        const {
            items,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            shippingPrice,
            taxPrice,
            totalPrice,
            promoCode,
        } = req.body;

        if (!items || items.length === 0) {
            return sendError(res, 400, 'No order items provided');
        }

        // Create order
        const order = await Order.create({
            user: req.user.id,
            items,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            shippingPrice,
            taxPrice,
            totalPrice,
            promoCode,
        });

        // Update product stock
        for (const item of items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: -item.quantity },
            });
        }

        // Clear user cart
        await Cart.findOneAndUpdate(
            { user: req.user.id },
            { items: [] }
        );

        sendSuccess(res, 201, 'Order created successfully', { order });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/orders
 * @desc    Get user orders
 * @access  Private
 */
export const getMyOrders = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const { skip, limit: limitNum, page: pageNum } = getPagination(page, limit);

        const orders = await Order.find({ user: req.user.id })
            .sort('-createdAt')
            .skip(skip)
            .limit(limitNum);

        const total = await Order.countDocuments({ user: req.user.id });
        const pagination = buildPaginationMeta(total, pageNum, limitNum);

        sendSuccess(res, 200, 'Orders retrieved successfully', { orders, pagination });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/orders/:id
 * @desc    Get order by ID
 * @access  Private
 */
export const getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (!order) {
            return sendError(res, 404, 'Order not found');
        }

        // Check if order belongs to user or user is admin
        if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return sendError(res, 403, 'Not authorized to access this order');
        }

        sendSuccess(res, 200, 'Order retrieved successfully', { order });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/orders/admin/all
 * @desc    Get all orders (Admin)
 * @access  Private/Admin
 */
export const getAllOrders = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const { skip, limit: limitNum, page: pageNum } = getPagination(page, limit);

        const query = {};
        if (status) {
            query.orderStatus = status;
        }

        const orders = await Order.find(query)
            .populate('user', 'name email')
            .sort('-createdAt')
            .skip(skip)
            .limit(limitNum);

        const total = await Order.countDocuments(query);
        const pagination = buildPaginationMeta(total, pageNum, limitNum);

        sendSuccess(res, 200, 'Orders retrieved successfully', { orders, pagination });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order status (Admin)
 * @access  Private/Admin
 */
export const updateOrderStatus = async (req, res, next) => {
    try {
        const { status, note } = req.body;

        const order = await Order.findById(req.params.id);

        if (!order) {
            return sendError(res, 404, 'Order not found');
        }

        order.orderStatus = status;

        if (status === ORDER_STATUS.DELIVERED) {
            order.deliveredAt = Date.now();
        }

        if (note) {
            order.statusHistory[order.statusHistory.length - 1].note = note;
        }

        await order.save();

        sendSuccess(res, 200, 'Order status updated successfully', { order });
    } catch (error) {
        next(error);
    }
};

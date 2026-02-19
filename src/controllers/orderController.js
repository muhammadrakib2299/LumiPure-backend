import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { sendSuccess, sendError, getPagination, buildPaginationMeta } from '../utils/helpers.js';
import { ORDER_STATUS, USER_ROLES } from '../config/constants.js';

/**
 * Valid order status transitions
 */
const VALID_TRANSITIONS = {
    [ORDER_STATUS.PENDING]: [ORDER_STATUS.PROCESSING, ORDER_STATUS.CANCELLED],
    [ORDER_STATUS.PROCESSING]: [ORDER_STATUS.SHIPPED, ORDER_STATUS.CANCELLED],
    [ORDER_STATUS.SHIPPED]: [ORDER_STATUS.DELIVERED],
    [ORDER_STATUS.DELIVERED]: [],
    [ORDER_STATUS.CANCELLED]: [],
};

/**
 * @route   POST /api/orders
 * @desc    Create new order
 * @access  Private
 */
export const createOrder = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

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

        // Validate stock for all items atomically
        for (const item of items) {
            const result = await Product.findOneAndUpdate(
                { _id: item.product, stock: { $gte: item.quantity } },
                { $inc: { stock: -item.quantity } },
                { new: true, session }
            );

            if (!result) {
                await session.abortTransaction();
                return sendError(res, 400, `Insufficient stock for product ${item.name || item.product}`);
            }
        }

        // Create order
        const [order] = await Order.create(
            [
                {
                    user: req.user.id,
                    items,
                    shippingAddress,
                    paymentMethod,
                    itemsPrice,
                    shippingPrice,
                    taxPrice,
                    totalPrice,
                    promoCode,
                },
            ],
            { session }
        );

        // Clear user cart using save() so pre('save') hook recalculates totals
        const cart = await Cart.findOne({ user: req.user.id }).session(session);
        if (cart) {
            cart.items = [];
            await cart.save({ session });
        }

        await session.commitTransaction();

        sendSuccess(res, 201, 'Order created successfully', { order });
    } catch (error) {
        await session.abortTransaction();
        next(error);
    } finally {
        session.endSession();
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

        const query = { user: req.user.id };

        const [orders, total] = await Promise.all([
            Order.find(query).sort('-createdAt').skip(skip).limit(limitNum),
            Order.countDocuments(query),
        ]);

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
        if (order.user._id.toString() !== req.user.id && req.user.role !== USER_ROLES.ADMIN) {
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

        const [orders, total] = await Promise.all([
            Order.find(query)
                .populate('user', 'name email')
                .sort('-createdAt')
                .skip(skip)
                .limit(limitNum),
            Order.countDocuments(query),
        ]);

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

        if (!status || !Object.values(ORDER_STATUS).includes(status)) {
            return sendError(res, 400, 'Invalid order status');
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return sendError(res, 404, 'Order not found');
        }

        // Validate status transition
        const allowedTransitions = VALID_TRANSITIONS[order.orderStatus];
        if (!allowedTransitions || !allowedTransitions.includes(status)) {
            return sendError(
                res,
                400,
                `Cannot transition from '${order.orderStatus}' to '${status}'`
            );
        }

        order.orderStatus = status;

        if (status === ORDER_STATUS.DELIVERED) {
            order.deliveredAt = Date.now();
        }

        // Manually push status history with note (before save, so the pre-save hook doesn't duplicate)
        order.statusHistory.push({
            status,
            timestamp: new Date(),
            note: note || undefined,
        });

        // Mark statusHistory as modified and skip the pre-save hook's push
        // by setting orderStatus as unmodified after our manual push
        await order.save();

        sendSuccess(res, 200, 'Order status updated successfully', { order });
    } catch (error) {
        next(error);
    }
};

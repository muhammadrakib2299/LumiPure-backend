import Product from '../models/Product.js';
import { sendSuccess, sendError, getPagination, buildPaginationMeta } from '../utils/helpers.js';
import { uploadImage, deleteImage } from '../config/cloudinary.js';

/**
 * @route   GET /api/products
 * @desc    Get all products with filters and pagination
 * @access  Public
 */
export const getProducts = async (req, res, next) => {
    try {
        const { page = 1, limit = 12, category, search, minPrice, maxPrice, sort = '-createdAt' } = req.query;

        const { skip, limit: limitNum, page: pageNum } = getPagination(page, limit);

        // Build query
        const query = { isActive: true };

        if (category) {
            query.category = category;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } },
            ];
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }

        // Get products
        const products = await Product.find(query)
            .populate('category', 'name slug')
            .sort(sort)
            .skip(skip)
            .limit(limitNum);

        const total = await Product.countDocuments(query);

        const pagination = buildPaginationMeta(total, pageNum, limitNum);

        sendSuccess(res, 200, 'Products retrieved successfully', {
            products,
            pagination,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/products/:id
 * @desc    Get single product
 * @access  Public
 */
export const getProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name slug');

        if (!product) {
            return sendError(res, 404, 'Product not found');
        }

        sendSuccess(res, 200, 'Product retrieved successfully', { product });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/products
 * @desc    Create new product
 * @access  Private/Admin
 */
export const createProduct = async (req, res, next) => {
    try {
        const product = await Product.create(req.body);

        sendSuccess(res, 201, 'Product created successfully', { product });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   PUT /api/products/:id
 * @desc    Update product
 * @access  Private/Admin
 */
export const updateProduct = async (req, res, next) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!product) {
            return sendError(res, 404, 'Product not found');
        }

        sendSuccess(res, 200, 'Product updated successfully', { product });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete product
 * @access  Private/Admin
 */
export const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return sendError(res, 404, 'Product not found');
        }

        // Delete images from Cloudinary
        for (const image of product.images) {
            if (image.public_id) {
                await deleteImage(image.public_id);
            }
        }

        await product.deleteOne();

        sendSuccess(res, 200, 'Product deleted successfully');
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/products/:id/images
 * @desc    Upload product images
 * @access  Private/Admin
 */
export const uploadProductImages = async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            return sendError(res, 400, 'Please upload at least one image');
        }

        const product = await Product.findById(req.params.id);

        if (!product) {
            return sendError(res, 404, 'Product not found');
        }

        const images = [];

        for (const file of req.files) {
            const result = await uploadImage(file.path, 'lumipure/products');
            images.push({
                public_id: result.public_id,
                url: result.secure_url,
            });
        }

        product.images.push(...images);
        await product.save();

        sendSuccess(res, 200, 'Images uploaded successfully', { images });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/products/featured
 * @desc    Get featured products
 * @access  Public
 */
export const getFeaturedProducts = async (req, res, next) => {
    try {
        const products = await Product.find({ isFeatured: true, isActive: true })
            .populate('category', 'name slug')
            .limit(8)
            .sort('-createdAt');

        sendSuccess(res, 200, 'Featured products retrieved successfully', { products });
    } catch (error) {
        next(error);
    }
};

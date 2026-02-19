import Product from '../models/Product.js';
import { sendSuccess, sendError, getPagination, buildPaginationMeta } from '../utils/helpers.js';
import { uploadImage, deleteImage } from '../config/cloudinary.js';
import fs from 'fs';

/**
 * Escape special regex characters in user input
 */
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Allowed fields for product creation/update
 */
const PRODUCT_FIELDS = [
    'name', 'description', 'shortDescription', 'price', 'comparePrice',
    'category', 'stock', 'sku', 'brand', 'variants', 'ingredients',
    'howToUse', 'isFeatured', 'isActive', 'tags', 'seoTitle', 'seoDescription',
];

const pickFields = (body, fields) => {
    const result = {};
    for (const field of fields) {
        if (body[field] !== undefined) {
            result[field] = body[field];
        }
    }
    return result;
};

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
            const escaped = escapeRegex(search);
            query.$or = [
                { name: { $regex: escaped, $options: 'i' } },
                { description: { $regex: escaped, $options: 'i' } },
                { brand: { $regex: escaped, $options: 'i' } },
            ];
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }

        // Run find and count in parallel
        const [products, total] = await Promise.all([
            Product.find(query)
                .populate('category', 'name slug')
                .sort(sort)
                .skip(skip)
                .limit(limitNum),
            Product.countDocuments(query),
        ]);

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
        const data = pickFields(req.body, PRODUCT_FIELDS);
        const product = await Product.create(data);

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
        const data = pickFields(req.body, PRODUCT_FIELDS);

        // Use findOne + save to trigger pre('save') hooks (slug generation)
        const product = await Product.findById(req.params.id);

        if (!product) {
            return sendError(res, 404, 'Product not found');
        }

        Object.assign(product, data);
        await product.save();

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

        // Delete images from Cloudinary in parallel
        await Promise.all(
            product.images
                .filter((image) => image.public_id)
                .map((image) => deleteImage(image.public_id))
        );

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

        // Upload images in parallel and clean up temp files
        const images = await Promise.all(
            req.files.map(async (file) => {
                try {
                    const result = await uploadImage(file.path, 'lumipure/products');
                    return { public_id: result.public_id, url: result.secure_url };
                } finally {
                    // Clean up temp file from disk
                    fs.unlink(file.path, () => {});
                }
            })
        );

        product.images.push(...images);
        await product.save();

        sendSuccess(res, 200, 'Images uploaded successfully', { images });
    } catch (error) {
        // Clean up any remaining temp files on error
        if (req.files) {
            req.files.forEach((file) => fs.unlink(file.path, () => {}));
        }
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

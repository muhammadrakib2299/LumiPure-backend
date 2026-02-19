import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { sendSuccess, sendError } from '../utils/helpers.js';

const CATEGORY_FIELDS = ['name', 'description', 'image', 'parentCategory', 'isActive'];

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
 * @route   GET /api/categories
 * @desc    Get all categories
 * @access  Public
 */
export const getCategories = async (req, res, next) => {
    try {
        const categories = await Category.find({ isActive: true })
            .populate('parentCategory', 'name slug')
            .sort('name');

        sendSuccess(res, 200, 'Categories retrieved successfully', { categories });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/categories/:id
 * @desc    Get single category
 * @access  Public
 */
export const getCategory = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id)
            .populate('parentCategory', 'name slug');

        if (!category) {
            return sendError(res, 404, 'Category not found');
        }

        sendSuccess(res, 200, 'Category retrieved successfully', { category });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/categories
 * @desc    Create category
 * @access  Private/Admin
 */
export const createCategory = async (req, res, next) => {
    try {
        const data = pickFields(req.body, CATEGORY_FIELDS);
        const category = await Category.create(data);

        sendSuccess(res, 201, 'Category created successfully', { category });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   PUT /api/categories/:id
 * @desc    Update category
 * @access  Private/Admin
 */
export const updateCategory = async (req, res, next) => {
    try {
        const data = pickFields(req.body, CATEGORY_FIELDS);

        // Use findOne + save to trigger pre('save') hooks (slug generation)
        const category = await Category.findById(req.params.id);

        if (!category) {
            return sendError(res, 404, 'Category not found');
        }

        Object.assign(category, data);
        await category.save();

        sendSuccess(res, 200, 'Category updated successfully', { category });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete category
 * @access  Private/Admin
 */
export const deleteCategory = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return sendError(res, 404, 'Category not found');
        }

        // Deactivate products in this category instead of leaving orphans
        await Product.updateMany(
            { category: category._id },
            { isActive: false }
        );

        await category.deleteOne();

        sendSuccess(res, 200, 'Category deleted successfully');
    } catch (error) {
        next(error);
    }
};

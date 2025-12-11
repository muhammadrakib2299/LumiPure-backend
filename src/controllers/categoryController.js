import Category from '../models/Category.js';
import { sendSuccess, sendError } from '../utils/helpers.js';

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
 * @route   POST /api/categories
 * @desc    Create category
 * @access  Private/Admin
 */
export const createCategory = async (req, res, next) => {
    try {
        const category = await Category.create(req.body);

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
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!category) {
            return sendError(res, 404, 'Category not found');
        }

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
        const category = await Category.findByIdAndDelete(req.params.id);

        if (!category) {
            return sendError(res, 404, 'Category not found');
        }

        sendSuccess(res, 200, 'Category deleted successfully');
    } catch (error) {
        next(error);
    }
};

import HeroSlide from '../models/HeroSlide.js';
import { sendSuccess, sendError } from '../utils/helpers.js';
import { uploadImage, deleteImage } from '../config/cloudinary.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

const HERO_FIELDS = ['title', 'subtitle', 'mediaType', 'buttonText', 'buttonLink', 'order', 'isActive'];

const filterFields = (body, allowedFields) => {
    const filtered = {};
    Object.keys(body).forEach((key) => {
        if (allowedFields.includes(key)) {
            filtered[key] = body[key];
        }
    });
    return filtered;
};

/**
 * Get all active hero slides (Public)
 */
export const getHeroSlides = async (req, res, next) => {
    try {
        const slides = await HeroSlide.find({ isActive: true }).sort({ order: 1 });
        return sendSuccess(res, 200, 'Hero slides fetched successfully', { slides });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all hero slides including inactive (Admin)
 */
export const getAllHeroSlides = async (req, res, next) => {
    try {
        const slides = await HeroSlide.find().sort({ order: 1 });
        return sendSuccess(res, 200, 'All hero slides fetched successfully', { slides });
    } catch (error) {
        next(error);
    }
};

/**
 * Get single hero slide
 */
export const getHeroSlide = async (req, res, next) => {
    try {
        const slide = await HeroSlide.findById(req.params.id);
        if (!slide) {
            return sendError(res, 404, 'Hero slide not found');
        }
        return sendSuccess(res, 200, 'Hero slide fetched successfully', { slide });
    } catch (error) {
        next(error);
    }
};

/**
 * Create hero slide (Admin)
 */
export const createHeroSlide = async (req, res, next) => {
    try {
        const fields = filterFields(req.body, HERO_FIELDS);

        if (!req.file) {
            return sendError(res, 400, 'Media file is required');
        }

        // Determine resource type
        const isVideo = req.file.mimetype.startsWith('video/');
        fields.mediaType = isVideo ? 'video' : 'image';

        // Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
            folder: 'lumipure/hero',
            resource_type: isVideo ? 'video' : 'image',
            ...(isVideo
                ? {}
                : {
                      transformation: [
                          { width: 1920, crop: 'scale' },
                          { quality: 'auto' },
                          { fetch_format: 'auto' },
                      ],
                  }),
        });

        // Remove temp file
        fs.unlink(req.file.path, () => {});

        fields.media = {
            public_id: uploadResult.public_id,
            url: uploadResult.secure_url,
        };

        const slide = await HeroSlide.create(fields);
        return sendSuccess(res, 201, 'Hero slide created successfully', { slide });
    } catch (error) {
        // Clean up temp file on error
        if (req.file?.path) {
            fs.unlink(req.file.path, () => {});
        }
        next(error);
    }
};

/**
 * Update hero slide (Admin)
 */
export const updateHeroSlide = async (req, res, next) => {
    try {
        const slide = await HeroSlide.findById(req.params.id);
        if (!slide) {
            return sendError(res, 404, 'Hero slide not found');
        }

        const fields = filterFields(req.body, HERO_FIELDS);

        // If new media file uploaded
        if (req.file) {
            const isVideo = req.file.mimetype.startsWith('video/');
            fields.mediaType = isVideo ? 'video' : 'image';

            const uploadResult = await cloudinary.uploader.upload(req.file.path, {
                folder: 'lumipure/hero',
                resource_type: isVideo ? 'video' : 'image',
                ...(isVideo
                    ? {}
                    : {
                          transformation: [
                              { width: 1920, crop: 'scale' },
                              { quality: 'auto' },
                              { fetch_format: 'auto' },
                          ],
                      }),
            });

            fs.unlink(req.file.path, () => {});

            // Delete old media from Cloudinary
            if (slide.media?.public_id) {
                try {
                    await cloudinary.uploader.destroy(slide.media.public_id, {
                        resource_type: slide.mediaType === 'video' ? 'video' : 'image',
                    });
                } catch (e) {
                    // Ignore deletion errors
                }
            }

            fields.media = {
                public_id: uploadResult.public_id,
                url: uploadResult.secure_url,
            };
        }

        const updated = await HeroSlide.findByIdAndUpdate(req.params.id, fields, {
            new: true,
            runValidators: true,
        });

        return sendSuccess(res, 200, 'Hero slide updated successfully', { slide: updated });
    } catch (error) {
        if (req.file?.path) {
            fs.unlink(req.file.path, () => {});
        }
        next(error);
    }
};

/**
 * Delete hero slide (Admin)
 */
export const deleteHeroSlide = async (req, res, next) => {
    try {
        const slide = await HeroSlide.findById(req.params.id);
        if (!slide) {
            return sendError(res, 404, 'Hero slide not found');
        }

        // Delete media from Cloudinary
        if (slide.media?.public_id) {
            try {
                await cloudinary.uploader.destroy(slide.media.public_id, {
                    resource_type: slide.mediaType === 'video' ? 'video' : 'image',
                });
            } catch (e) {
                // Ignore deletion errors
            }
        }

        await HeroSlide.findByIdAndDelete(req.params.id);
        return sendSuccess(res, 200, 'Hero slide deleted successfully');
    } catch (error) {
        next(error);
    }
};

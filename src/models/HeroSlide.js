import mongoose from 'mongoose';

const heroSlideSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
            maxlength: [100, 'Title cannot exceed 100 characters'],
        },
        subtitle: {
            type: String,
            trim: true,
            maxlength: [200, 'Subtitle cannot exceed 200 characters'],
        },
        mediaType: {
            type: String,
            enum: ['image', 'video'],
            required: [true, 'Media type is required'],
        },
        media: {
            public_id: String,
            url: {
                type: String,
                required: [true, 'Media URL is required'],
            },
        },
        buttonText: {
            type: String,
            trim: true,
            maxlength: [30, 'Button text cannot exceed 30 characters'],
        },
        buttonLink: {
            type: String,
            trim: true,
        },
        order: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

heroSlideSchema.index({ isActive: 1, order: 1 });

const HeroSlide = mongoose.model('HeroSlide', heroSlideSchema);

export default HeroSlide;

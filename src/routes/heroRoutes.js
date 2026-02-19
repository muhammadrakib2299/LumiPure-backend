import express from 'express';
import {
    getHeroSlides,
    getAllHeroSlides,
    getHeroSlide,
    createHeroSlide,
    updateHeroSlide,
    deleteHeroSlide,
} from '../controllers/heroController.js';
import { protect, adminOnly } from '../middlewares/auth.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

// Public
router.get('/', getHeroSlides);

// Admin
router.get('/all', protect, adminOnly, getAllHeroSlides);
router.get('/:id', protect, adminOnly, getHeroSlide);
router.post('/', protect, adminOnly, upload.single('media'), createHeroSlide);
router.put('/:id', protect, adminOnly, upload.single('media'), updateHeroSlide);
router.delete('/:id', protect, adminOnly, deleteHeroSlide);

export default router;

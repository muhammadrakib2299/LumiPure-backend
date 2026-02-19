import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(
            null,
            file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
        );
    },
});

// File filter
const fileFilter = (req, file, cb) => {
    const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
    const allowedVideoTypes = /mp4|webm|mov/;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');

    const isImage = allowedImageTypes.test(ext) && allowedImageTypes.test(file.mimetype);
    const isVideo = allowedVideoTypes.test(ext) || file.mimetype.startsWith('video/');

    if (isImage || isVideo) {
        return cb(null, true);
    } else {
        cb(new Error('Only image (jpeg, jpg, png, gif, webp) and video (mp4, webm, mov) files are allowed'));
    }
};

// Multer configuration
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB max file size (for video support)
    },
    fileFilter: fileFilter,
});

export default upload;

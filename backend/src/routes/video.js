import express from 'express';
import { uploadVideo, getVideos, getVideoById, streamVideo, deleteVideo, updateVideo, assignVideo } from '../controllers/videoController.js';
import { protect } from '../middleware/auth.js';
import { canEdit } from '../middleware/rbac.js';
import { upload, handleMulterError } from '../config/multer.js';

const router = express.Router();

router.post('/upload', protect, canEdit, upload.single('video'), handleMulterError, uploadVideo);
router.get('/', protect, getVideos);
router.get('/:id', protect, getVideoById);
router.get('/:id/stream', streamVideo);
router.delete('/:id', protect, deleteVideo);
router.patch('/:id', protect, canEdit, updateVideo);
router.post('/:id/assign', protect, canEdit, assignVideo);

export default router;
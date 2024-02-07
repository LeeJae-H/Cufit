import express from 'express';
import multer from '../middlewares/multer';
import { uploadImage, deleteImage } from '../controllers/image.controller';

const router = express.Router();

router.post('/upload', multer.single('image'), uploadImage); // 이미지 업로드
router.delete('/delete', deleteImage); // 이미지 불러오기

export default router;

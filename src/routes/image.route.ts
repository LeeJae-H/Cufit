import express from 'express';
import upload from '../middlewares/multer';
import { uploadImage, deleteImage } from '../controllers/image.controller';

const router = express.Router();

router.post('/', upload.single('image'), uploadImage); // 이미지 업로드
router.delete('/', deleteImage); // 이미지 삭제

export default router;

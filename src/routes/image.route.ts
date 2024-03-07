import express from 'express';
import { uploadImage, deleteImage } from '../controllers/image.controller';

import multer from 'multer'; // multipart/form-data
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

router.post('/', upload.single('image'), uploadImage); // 이미지 업로드
router.delete('/', deleteImage); // 이미지 삭제

export default router;

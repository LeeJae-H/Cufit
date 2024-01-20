import express from 'express';
import { saveUser, getAllUsers, getUser, updateUser, deleteUser, uploadImage, getImage } from '../controllers/zzz';
import multer from '../middlewares/multer';

const router = express.Router();

router.post('/', saveUser); // 사용자 등록
router.get('/', getAllUsers); // 모든 사용자 조회
router.get('/:name', getUser); // 특정 사용자 조회
router.put('/:name', updateUser); // 특정 사용자 수정
router.delete('/:name', deleteUser); // 특정 사용자 삭제

router.post('/image', multer.single('image'), uploadImage); // 이미지 업로드
router.get('/image/:name', getImage); // 이미지 불러오기

export default router;

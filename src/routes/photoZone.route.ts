import express from 'express';
import verifyIdToken from '../middlewares/authMiddleware';
import { uploadPhotozone, deletePhotozone, updatePhotozone,
    getPhotozoneByDistance, searchPhotozones, getDetail
} from '../controllers/photoZone.controller'

const router = express.Router();

router.post('/', uploadPhotozone);
router.delete('/:id', verifyIdToken, deletePhotozone);
router.patch('/', verifyIdToken, updatePhotozone);
router.get('/near', getPhotozoneByDistance);
router.get('/:keyword/search', searchPhotozones);
router.get('/:photoZoneId/detail', getDetail);

export default router;

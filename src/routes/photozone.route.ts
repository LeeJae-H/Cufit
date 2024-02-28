import express from 'express';
import verifyIdToken from '../middlewares/authMiddleware';
import { uploadPhotozone, deletePhotozone, updatePhotozone,
    getPhotozoneByDistance, searchPhotozones 
} from '../controllers/photozone.controller'

const router = express.Router();

router.post('/', uploadPhotozone);
router.delete('/', verifyIdToken, deletePhotozone);
router.patch('/', verifyIdToken, updatePhotozone);
router.get('/near', getPhotozoneByDistance);
router.get('/search/:keyword', searchPhotozones);


export default router;

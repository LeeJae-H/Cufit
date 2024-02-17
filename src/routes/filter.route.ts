import express from 'express';
import { uploadFilter, getFilterTop5, 
    getFilterById, getFilterByCreatorId, getFilterByUid, getFilterByKeyword 
} from '../controllers/filter.controller';

const router = express.Router();

router.post('/', uploadFilter);
router.get("/", getFilterTop5);
router.get("/id/:id", getFilterById);
router.get("/uid/:uid", getFilterByUid);
router.get("/search/:keyword", getFilterByKeyword);

export default router;

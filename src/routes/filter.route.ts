import express from 'express';
import { uploadFilter, getFilterTop5, 
    getFilterById, getFilterByCreatorId, getFilterByUid, getFilterByKeyword 
} from '../controllers/filter.controller';

const router = express.Router();

router.post('/upload', uploadFilter);
router.get("/main", getFilterTop5);
router.get("/:id", getFilterById);
router.get("/cid/:cid", getFilterByCreatorId);
router.get("/uid/:uid", getFilterByUid);
router.get("/search/:keyword", getFilterByKeyword);

export default router;

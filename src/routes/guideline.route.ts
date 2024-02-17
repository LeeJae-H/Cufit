import express from 'express';
import { uploadGuideline, getGuidelineTop5, 
    getGuidelineById, getGuidelineByUid, getGuidelineByKeyword, getGuidelineByDistance   
} from '../controllers/guideline.controller';

const router = express.Router();

router.post('/', uploadGuideline);
router.get("/", getGuidelineTop5);
router.get("/id/:id", getGuidelineById);
router.get("/uid/:uid", getGuidelineByUid);
router.get("/search/:keyword", getGuidelineByKeyword);
router.get("/near", getGuidelineByDistance);

export default router;

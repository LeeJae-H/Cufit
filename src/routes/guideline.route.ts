import express from 'express';
import { uploadGuideline, getGuidelineTop5, 
    getGuidelineById, getGuidelineByUid, getGuidelineByKeyword, getGuidelineByDistance   
} from '../controllers/guideline.controller';

const router = express.Router();

router.post('/upload', uploadGuideline);
router.get("/main", getGuidelineTop5);
router.get("/:id", getGuidelineById);
router.get("/uid/:uid", getGuidelineByUid);
router.get("/search/:keyword", getGuidelineByKeyword);
router.get("/near", getGuidelineByDistance);

export default router;

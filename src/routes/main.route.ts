import express from 'express';
import { getTodayGuideline, getTodayPhotozone, getTagList } from '../controllers/main.controller';

const router = express.Router();

router.get("/tag-list", getTagList);
router.get("/today/guideline", getTodayGuideline);
router.get("/today/photozone", getTodayPhotozone);

export default router;

import express from 'express';
import { getGuidelines, getPhotoZones, getTagList } from '../controllers/admin.controller';

const router = express.Router();

router.get("/tag-list", getTagList);
router.get("/photozones", getPhotoZones);
router.get("/guidelines", getGuidelines);

export default router;

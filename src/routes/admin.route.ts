import express from 'express';
import { 
    postStatus, getContent, getContents, postContents, getTodayPhotoZones, getTodayGuidelines, getTagList,
    getFaqs, getProducts, postFaqAnswer, postAuth, uploadTagList, modifyTagList, uploadPhotoZone, uploadGuideline,
    allGuidelines, allPhotozones, modifyGuideline, modifyPhotoZone, getTrendingPoseList, uploadTrendingPoseList, modifyTrendingPoseList, deleteTagList, deleteTodayPhotozone, deleteTodayGuideline, deleteTrendingPose, getReports
} from '../controllers/admin.controller';

const router = express.Router();

router.post("/status", postStatus);
router.get("/main/contents", getContent);
router.get("/main/contents/history", getContents);
router.post("/main/contents", postContents);
router.get('/faq/list', getFaqs);
router.get('/report/list', getReports);
router.get('/product', getProducts);
router.post('/faq/answer/:faqId', postFaqAnswer);
router.post("/authorize", postAuth);

// popular tag-list
router.get("/tag-list", getTagList);
router.post("/tag-list", uploadTagList);
router.patch("/tag-list", modifyTagList);
router.delete("/tag-list", deleteTagList);

// today photozones
router.get("/today/photozones", getTodayPhotoZones);
router.post("/today/photozone", uploadPhotoZone);
router.patch("/today/photozone", modifyGuideline);
router.delete("/today/photozone", deleteTodayPhotozone);

// today guidelines
router.get("/today/guidelines", getTodayGuidelines);
router.post("/today/guideline", uploadGuideline);
router.patch("/today/guideline", modifyPhotoZone);
router.delete("/today/guideline", deleteTodayGuideline);

// trending tag-list
router.get("/trending/pose", getTrendingPoseList);
router.post("/trending/pose", uploadTrendingPoseList);
router.patch("/trending/pose", modifyTrendingPoseList);
router.delete("/trending/pose", deleteTrendingPose);

// all guidelines, photozones
router.get("/guidelines", allGuidelines);
router.get("/photozones", allPhotozones);

// TODO: - 구현하기
router.get("/users")

export default router;

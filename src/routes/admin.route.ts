import express from 'express';
import { 
    postStatus, getContent, getContents, postContents, getTodayPhotoZones, getTodayGuidelines, getTagList,
    getFaqs, getProducts, postFaqAnswer, postAuth, uploadTagList, modifyTagList, uploadPhotoZone, uploadGuideline,
    allGuidelines, allPhotozones
} from '../controllers/admin.controller';

const router = express.Router();

router.post("/status", postStatus);
router.get("/main/contents", getContent);
router.get("/main/contents/history", getContents);
router.post("/main/contents", postContents);
router.get('/faq/list', getFaqs);
router.get('/product', getProducts);
router.post('/faq/answer/:faqId', postFaqAnswer);
router.post("/authorize", postAuth);

router.get("/tag-list", getTagList);
router.post("/tag-list", uploadTagList);
router.patch("/tag-list", modifyTagList);

router.get("/today/photozones", getTodayPhotoZones);
router.post("/today/photozone", uploadPhotoZone);
router.patch("/today/photozone", modifyTagList);

router.get("/today/guidelines", getTodayGuidelines);
router.post("/today/guideline", uploadGuideline);
router.patch("/today/guideline", modifyTagList);

router.get("/guidelines", allGuidelines);
router.get("/photozones", allPhotozones);

// TODO: - 구현하기
router.get("/users")

export default router;

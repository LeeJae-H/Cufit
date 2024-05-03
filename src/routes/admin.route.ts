import express from 'express';
import { postStatus, getContent, getContents, postContents, 
    getFaqs, getProducts, postFaqAnswer, postAuth, uploadTagList, modifyTagList, uploadPhotoZone, uploadGuideline
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

router.post("/tag-list", uploadTagList);
router.patch("/tag-list", modifyTagList);
router.post("/photozone", uploadPhotoZone);
router.patch("/photozone", modifyTagList);
router.post("/guideline", uploadGuideline);
router.patch("/guideline", modifyTagList);

export default router;

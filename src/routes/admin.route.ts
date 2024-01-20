import express from 'express';
import { postStatus, getContent, getContents, postContents, 
    getFaqs, getProducts, postFaqAnswer, postAuth
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

export default router;

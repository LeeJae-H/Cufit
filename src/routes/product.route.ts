import express from 'express';
import { getDetail, getReview, 
    writeReview, like, wish 
} from '../controllers/product.controller';

const router = express.Router();

router.get("/detail/:productId", getDetail); // product의 세부 사항 조회
router.get("/review/:productId", getReview); // product의 review 조회
router.post("/review/:productId", writeReview); // review 쓰기
router.post("/like", like); // like 하기
router.post("/wish", wish); // wish 하기

export default router;

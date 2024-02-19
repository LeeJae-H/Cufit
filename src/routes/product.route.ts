import express from 'express';
import { getDetail, getReview, 
} from '../controllers/product.controller';

const router = express.Router();

router.get("/:productId/detail", getDetail); // product의 세부 사항 조회
router.get("/:productId/review", getReview); // product의 review 조회

export default router;

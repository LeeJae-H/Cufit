import express from 'express';
import { getAnything, searchCreators, searchGuidelines, searchFilters, 
    getGuidelineInArea, getPhotozoneInArea
} from '../controllers/search.controller';

const router = express.Router();

router.get("/anything/:keyword", getAnything) // 키워드로 사용자, 가이드라인, 필터 조회
router.get("/creators/:keyword", searchCreators) // 키워드로 사용자 조회
router.get("/guidelines/:keyword", searchGuidelines) // 키워드로 가이드라인 조회
router.get("/filters/:keyword", searchFilters) // 키워드로 필터 조회

router.get("/area/guidelines", getGuidelineInArea)
router.get("/area/photozones", getPhotozoneInArea)

export default router;

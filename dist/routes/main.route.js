"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const main_controller_1 = require("../controllers/main.controller");
const router = express_1.default.Router();
router.get("/tag-list", main_controller_1.getTagList);
// 아래 컨트롤러 함수에서 코멘트 확인 후 요구사항 적용하기
router.get("/today/guideline", main_controller_1.getTodayGuideline);
router.get("/today/photozone", main_controller_1.getTodayPhotozone);
router.get("trending/guidelines");
router.get("popular/guidelines", main_controller_1.getPopularGuidelines);
router.get("popular/photozones", main_controller_1.getPopularPhotozones);
exports.default = router;

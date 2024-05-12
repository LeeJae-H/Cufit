"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const admin_controller_1 = require("../controllers/admin.controller");
const router = express_1.default.Router();
router.post("/status", admin_controller_1.postStatus);
router.get("/main/contents", admin_controller_1.getContent);
router.get("/main/contents/history", admin_controller_1.getContents);
router.post("/main/contents", admin_controller_1.postContents);
router.get('/faq/list', admin_controller_1.getFaqs);
router.get('/product', admin_controller_1.getProducts);
router.post('/faq/answer/:faqId', admin_controller_1.postFaqAnswer);
router.post("/authorize", admin_controller_1.postAuth);
// popular tag-list
router.get("/tag-list", admin_controller_1.getTagList);
router.post("/tag-list", admin_controller_1.uploadTagList);
router.patch("/tag-list", admin_controller_1.modifyTagList);
router.delete("/tag-list"); // TODO
// today photozones
router.get("/today/photozones", admin_controller_1.getTodayPhotoZones);
router.post("/today/photozone", admin_controller_1.uploadPhotoZone);
router.patch("/today/photozone", admin_controller_1.modifyGuideline);
router.delete("/today/photozone"); // TODO
// today guidelines
router.get("/today/guidelines", admin_controller_1.getTodayGuidelines);
router.post("/today/guideline", admin_controller_1.uploadGuideline);
router.patch("/today/guideline", admin_controller_1.modifyPhotoZone);
router.delete("/today/guideline"); // TODO
// trending tag-list
router.get("/trending/pose", admin_controller_1.getTrendingPoseList);
router.post("/trending/pose", admin_controller_1.uploadTrendingPoseList);
router.patch("/trending/pose", admin_controller_1.modifyTrendingPoseList);
router.delete("/trending/pose"); // TODO
// all guidelines, photozones
router.get("/guidelines", admin_controller_1.allGuidelines);
router.get("/photozones", admin_controller_1.allPhotozones);
// TODO: - 구현하기
router.get("/users");
exports.default = router;

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
exports.default = router;

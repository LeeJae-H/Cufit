"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const product_controller_1 = require("../controllers/product.controller");
const router = express_1.default.Router();
router.get("/detail/:productId", product_controller_1.getDetail); // product의 세부 사항 조회
router.get("/review/:productId", product_controller_1.getReview); // product의 review 조회
router.post("/review/:productId", product_controller_1.writeReview); // review 쓰기
router.post("/like", product_controller_1.like); // like 하기
router.post("/wish", product_controller_1.wish); // wish 하기
exports.default = router;

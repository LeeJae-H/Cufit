"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const product_controller_1 = require("../controllers/product.controller");
const router = express_1.default.Router();
router.get("/:productId/detail", product_controller_1.getDetail); // product의 세부 사항 조회
router.get("/:productId/review", product_controller_1.getReview); // product의 review 조회
exports.default = router;

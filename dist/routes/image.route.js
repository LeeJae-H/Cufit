"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("../middlewares/multer"));
const image_controller_1 = require("../controllers/image.controller");
const router = express_1.default.Router();
router.post('/', multer_1.default.single('image'), image_controller_1.uploadImage); // 이미지 업로드
router.delete('/', image_controller_1.deleteImage); // 이미지 삭제
exports.default = router;

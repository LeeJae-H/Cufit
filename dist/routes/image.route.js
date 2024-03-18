"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const image_controller_1 = require("../controllers/image.controller");
const multer_1 = __importDefault(require("multer")); // multipart/form-data
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage: storage });
const router = express_1.default.Router();
router.post('/', upload.single('image'), image_controller_1.uploadImage); // 이미지 업로드
router.delete('/', image_controller_1.deleteImage); // 이미지 삭제
exports.default = router;

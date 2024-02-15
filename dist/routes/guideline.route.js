"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const guideline_controller_1 = require("../controllers/guideline.controller");
const router = express_1.default.Router();
router.post('/', guideline_controller_1.uploadGuideline);
router.get("/", guideline_controller_1.getGuidelineTop5);
router.get("/:id", guideline_controller_1.getGuidelineById);
router.get("/:uid", guideline_controller_1.getGuidelineByUid);
router.get("/search/:keyword", guideline_controller_1.getGuidelineByKeyword);
router.get("/near", guideline_controller_1.getGuidelineByDistance);
exports.default = router;

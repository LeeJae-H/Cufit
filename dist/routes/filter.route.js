"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const filter_controller_1 = require("../controllers/filter.controller");
const router = express_1.default.Router();
router.post('/', filter_controller_1.uploadFilter);
router.get("/", filter_controller_1.getFilterTop5);
router.get("/id/:id", filter_controller_1.getFilterById);
router.get("/uid/:uid", filter_controller_1.getFilterByUid);
router.get("/search/:keyword", filter_controller_1.getFilterByKeyword);
exports.default = router;

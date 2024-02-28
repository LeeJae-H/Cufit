"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const search_controller_1 = require("../controllers/search.controller");
const router = express_1.default.Router();
router.get("/anything/:keyword", search_controller_1.getAnything); // 키워드로 사용자, 가이드라인, 필터 조회
router.get("/creators/:keyword", search_controller_1.searchCreators); // 키워드로 사용자, 가이드라인, 필터 조회
router.get("/guidelines/:keyword", search_controller_1.searchGuidelines); // 키워드로 사용자, 가이드라인, 필터 조회
router.get("/filters/:keyword", search_controller_1.searchFilters); // 키워드로 사용자, 가이드라인, 필터 조회
exports.default = router;

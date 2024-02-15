"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
const creator_controller_1 = require("../controllers/creator.controller");
const router = express_1.default.Router();
router.get("/income", authMiddleware_1.default, creator_controller_1.getIncome);
exports.default = router;

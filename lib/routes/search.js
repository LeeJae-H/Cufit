"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const filter_1 = require("../models/filter");
const user_1 = require("../models/user");
const guideline_1 = require("../models/guideline");
const router = express_1.default.Router();
router.get("/:keyword", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const keyword = req.params.keyword;
    // creator, guideline, filter
    if (keyword === "") {
        res.status(200).json({
            statusCode: -1,
            message: "Empty keyword.",
            result: {}
        });
        return;
    }
    const creator = yield user_1.User.search(keyword);
    const guideline = yield guideline_1.Guideline.newSearch(keyword);
    const filter = yield filter_1.Filter.newSearch(keyword);
    const result = {
        creator,
        guideline,
        filter
    };
    res.status(200).json({
        statusCode: 0,
        message: "Success",
        result: result
    });
}));
exports.default = router;

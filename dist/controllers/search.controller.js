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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnything = void 0;
const user_model_1 = require("../models/user.model");
const filter_model_1 = require("../models/filter.model");
const guideline_model_1 = require("../models/guideline.model");
const getAnything = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const keyword = req.params.keyword;
    try {
        // creator, guideline, filter
        if (keyword === "") {
            throw new Error("Empty keyword");
        }
        const creator = yield user_model_1.User.search(keyword);
        const guideline = yield guideline_model_1.Guideline.newSearch(keyword);
        const filter = yield filter_model_1.Filter.newSearch(keyword);
        res.status(200).json({
            statusCode: 0,
            message: "Success",
            result: {
                creator: creator,
                guideline: guideline,
                filter: filter
            }
        });
    }
    catch (error) {
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {}
        });
    }
});
exports.getAnything = getAnything;

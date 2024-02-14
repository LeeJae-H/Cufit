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
exports.postAuth = exports.postFaqAnswer = exports.getProducts = exports.getFaqs = exports.postContents = exports.getContents = exports.getContent = exports.postStatus = void 0;
const contents_model_1 = require("../models/contents.model");
const faq_model_1 = require("../models/faq.model");
const servserStatus_model_1 = require("../models/servserStatus.model");
const auth_model_1 = require("../models/auth.model");
const filter_model_1 = require("../models/filter.model");
const guideline_model_1 = require("../models/guideline.model");
const postStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const code = `${req.query.code}`;
    const upload = req.query.upload === "true";
    // code -> 0 = 서버 정상
    // 1 -> 점검중
    // 2 -> 테스트 플라이트 전용
    try {
        let currentStatus = yield servserStatus_model_1.Status.findOne({});
        currentStatus.code = parseInt(code);
        currentStatus.canUpload = upload;
        yield (currentStatus === null || currentStatus === void 0 ? void 0 : currentStatus.save());
        res.status(200).json({
            statusCode: 0,
            message: "Success",
            result: {}
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
exports.postStatus = postStatus;
const getContent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const type = `${req.query.type}`;
    try {
        const result = yield contents_model_1.Contents.findOne({ type: type }).sort({ _id: -1 });
        if (!result) {
            res.status(400).json({
                statusCode: -1,
                message: "Empty content list",
                result: {}
            });
        }
        else {
            res.status(200).json({
                statusCode: 0,
                message: "Successfully read content list",
                result: result
            });
        }
    }
    catch (error) {
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {}
        });
    }
});
exports.getContent = getContent;
const getContents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const type = `${req.query.type}`;
    try {
        const result = yield contents_model_1.Contents.find({ type: type }).sort({ _id: -1 });
        if (!result) {
            res.status(400).json({
                statusCode: -1,
                message: "Empty content list",
                result: {}
            });
        }
        else {
            res.status(200).json({
                statusCode: 0,
                message: "Successfully read content list",
                result: result
            });
        }
    }
    catch (error) {
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {}
        });
    }
});
exports.getContents = getContents;
const postContents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const newData = req.body.data;
    try {
        const newContents = new contents_model_1.Contents(newData);
        yield newContents.save();
        res.status(200).json({
            statusCode: 0,
            message: "Success",
            result: newContents
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
exports.postContents = postContents;
const getFaqs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const faqs = yield faq_model_1.Faq.list();
        res.status(200).json({
            statusCode: 0,
            message: "Successfully faqs read.",
            result: faqs
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
exports.getFaqs = getFaqs;
const getProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const type = req.query.type;
    const code = req.query.code;
    if (type === "Filter") {
        try {
            const filtered = yield filter_model_1.Filter.aggregate([
                {
                    $lookup: {
                        from: "auth",
                        localField: "_id",
                        foreignField: "productId",
                        as: "authStatus"
                    }
                },
                {
                    $unwind: "$authStatus"
                },
                {
                    $match: {
                        'authStatus.code': code
                    }
                },
                {
                    $sort: {
                        _id: -1
                    }
                }
            ]);
            const filteredIds = filtered.map(item => item._id).reverse();
            const result = yield filter_model_1.Filter.find({ _id: filteredIds })
                .populate('likedCount')
                .populate('wishedCount')
                .populate('usedCount')
                .populate('authStatus')
                .populate('creator');
            res.status(200).json({
                statusCode: -1,
                message: "Successfully load filters",
                result: result
            });
        }
        catch (error) {
            res.status(500).json({
                statusCode: -1,
                message: error,
                result: {}
            });
        }
    }
    else if (type === "Guideline") {
        try {
            const filtered = yield guideline_model_1.Guideline.aggregate([
                {
                    $lookup: {
                        from: "auth",
                        localField: "_id",
                        foreignField: "productId",
                        as: "authStatus"
                    }
                },
                {
                    $unwind: "$authStatus"
                },
                {
                    $match: {
                        'authStatus.code': code
                    }
                },
                {
                    $sort: {
                        _id: -1
                    }
                }
            ]);
            const filteredIds = filtered.map(item => item._id).reverse();
            const result = yield guideline_model_1.Guideline.find({ _id: filteredIds })
                .populate('likedCount')
                .populate('wishedCount')
                .populate('usedCount')
                .populate('authStatus')
                .populate('creator');
            res.status(200).json({
                statusCode: -1,
                message: "Successfully load filters",
                result: result
            });
        }
        catch (error) {
            res.status(500).json({
                statusCode: -1,
                message: error,
                result: {}
            });
        }
    }
});
exports.getProducts = getProducts;
const postFaqAnswer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const faqId = req.params.faqId;
    const { title, content } = req.body;
    try {
        const answerData = {
            faqId, title, content, createdAt: Date.now()
        };
        const newAnswer = yield faq_model_1.FaqAnswer.create(answerData);
        res.status(200).json({
            statusCode: 0,
            message: "Successfully answer uploaded",
            result: newAnswer
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
exports.postFaqAnswer = postFaqAnswer;
const postAuth = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const type = `${req.body.type}`;
    const productId = `${req.body.productId}`;
    const code = `${req.body.code}`;
    const message = req.body.message;
    if (!type || !productId || !code || !message) {
        return res.status(200).json({
            statusCode: -1,
            message: "essential data not found.",
            result: {}
        });
    }
    try {
        const result = yield auth_model_1.Auth.findOneAndUpdate({ productId }, { code, lastAt: Date.now(), message }, { new: true });
        res.status(200).json({
            statusCode: 0,
            message: "Success",
            result: result
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
exports.postAuth = postAuth;

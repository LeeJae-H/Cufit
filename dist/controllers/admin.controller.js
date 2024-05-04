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
exports.modifyGuideline = exports.uploadGuideline = exports.getTodayGuidelines = exports.modifyPhotoZone = exports.uploadPhotoZone = exports.getTodayPhotoZones = exports.modifyTagList = exports.uploadTagList = exports.getTagList = exports.postAuth = exports.postFaqAnswer = exports.getProducts = exports.getFaqs = exports.postContents = exports.getContents = exports.getContent = exports.postStatus = void 0;
const contents_model_1 = require("../models/contents.model");
const faq_model_1 = require("../models/faq.model");
const servserStatus_model_1 = require("../models/servserStatus.model");
const auth_model_1 = require("../models/auth.model");
const filter_model_1 = require("../models/filter.model");
const guideline_model_1 = require("../models/guideline.model");
const logger_1 = __importDefault(require("../config/logger"));
const popularTag_model_1 = require("../models/popularTag.model");
const todayPhotoZone_model_1 = require("../models/todayPhotoZone.model");
const todayGuideline_model_1 = require("../models/todayGuideline.model");
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
        logger_1.default.info("Successfully post status");
    }
    catch (error) {
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {}
        });
        logger_1.default.error(`Error post status: ${error}`);
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
            logger_1.default.error("Empty content list");
        }
        else {
            res.status(200).json({
                statusCode: 0,
                message: "Successfully read content list",
                result: result
            });
            logger_1.default.info("Successfully get content");
        }
    }
    catch (error) {
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {}
        });
        logger_1.default.error(`Error get content: ${error}`);
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
                message: "Empty contents list",
                result: {}
            });
            logger_1.default.error("Empty contents list");
        }
        else {
            res.status(200).json({
                statusCode: 0,
                message: "Successfully read contents list",
                result: result
            });
            logger_1.default.info("Successfully get contents");
        }
    }
    catch (error) {
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {}
        });
        logger_1.default.error(`Error get contents: ${error}`);
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
        logger_1.default.info("Successfully post contents");
    }
    catch (error) {
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {}
        });
        logger_1.default.error(`Error post contents: ${error}`);
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
        logger_1.default.info("Successfully get faqs");
    }
    catch (error) {
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {}
        });
        logger_1.default.error(`Error get faqs: ${error}`);
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
            logger_1.default.info("Successfully get filters");
        }
        catch (error) {
            res.status(500).json({
                statusCode: -1,
                message: error,
                result: {}
            });
            logger_1.default.error(`Error get filters: ${error}`);
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
                message: "Successfully load guidelines",
                result: result
            });
            logger_1.default.info("Successfully get guidelines");
        }
        catch (error) {
            res.status(500).json({
                statusCode: -1,
                message: error,
                result: {}
            });
            logger_1.default.error(`Error get guidelines: ${error}`);
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
        logger_1.default.info("Successfully post faq answer");
    }
    catch (error) {
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {}
        });
        logger_1.default.error(`Error post faq answer: ${error}`);
    }
});
exports.postFaqAnswer = postFaqAnswer;
const postAuth = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const type = `${req.body.type}`;
    const productId = `${req.body.productId}`;
    const code = `${req.body.code}`;
    const message = req.body.message;
    if (!type || !productId || !code || !message) {
        logger_1.default.error("essential data not found.");
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
        logger_1.default.info("Successfully post auth");
    }
    catch (error) {
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {}
        });
        logger_1.default.error(`Error post auth: ${error}`);
    }
});
exports.postAuth = postAuth;
// main.route.ts를 따로 만들었지만 일단 main.controller.ts말고 여기에 넣음, 아래 포토존및가이드라인도 마찬가지
const getTagList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tagList = yield popularTag_model_1.PopularTag.find();
        res.status(200).json({
            statusCode: 0,
            message: "Success",
            result: tagList
        });
        logger_1.default.info("Successfully get tag-list");
    }
    catch (error) {
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {}
        });
        logger_1.default.error(`Error get tag-list: ${error}`);
    }
});
exports.getTagList = getTagList;
const uploadTagList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, imageUrl, present } = req.body;
    const createdAt = Date.now();
    try {
        const tag = new popularTag_model_1.PopularTag({
            name: name,
            createdAt: createdAt,
            imageUrl: imageUrl,
            present: present
        });
        yield tag.save();
        res.status(200).json({
            statusCode: 0,
            message: "Success",
            result: tag
        });
        logger_1.default.info("Successfully upload tag-list");
    }
    catch (error) {
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {}
        });
        logger_1.default.error(`Error upload tag-list: ${error}`);
    }
});
exports.uploadTagList = uploadTagList;
const modifyTagList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, imageUrl, present } = req.body;
    const createdAt = Date.now();
    try {
        const tag = yield popularTag_model_1.PopularTag.findOne({ name: name });
        if (!tag) {
            return res.status(404).json({
                statusCode: -1,
                message: "Tag not found",
                result: {}
            });
        }
        if (name)
            tag.name = name;
        if (imageUrl)
            tag.imageUrl = imageUrl;
        if (present)
            tag.present = present;
        tag.createdAt = createdAt;
        yield tag.save();
        res.status(200).json({
            statusCode: 0,
            message: "Success",
            result: tag
        });
        logger_1.default.info("Successfully modify tag-list");
    }
    catch (error) {
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {}
        });
        logger_1.default.error(`Error modify tag-list: ${error}`);
    }
});
exports.modifyTagList = modifyTagList;
const getTodayPhotoZones = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const photoZones = yield todayPhotoZone_model_1.TodayPhotoZone.find();
        res.status(200).json({
            statusCode: 0,
            message: "Success",
            result: photoZones
        });
        logger_1.default.info("Successfully get photozones");
    }
    catch (error) {
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {}
        });
        logger_1.default.error(`Error get photozones: ${error}`);
    }
});
exports.getTodayPhotoZones = getTodayPhotoZones;
const uploadPhotoZone = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, productId, description, imageUrl } = req.body;
        const createdAt = Date.now();
        const photoZone = new todayPhotoZone_model_1.TodayPhotoZone({
            title: title,
            createdAt: createdAt,
            productId: productId,
            description: description,
            imageUrl: imageUrl
        });
        yield photoZone.save();
        res.status(200).json({
            statusCode: 0,
            message: "Successfully upload photozone",
            result: photoZone
        });
    }
    catch (error) {
        logger_1.default.error('Error upload photozone:', error);
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {}
        });
    }
});
exports.uploadPhotoZone = uploadPhotoZone;
const modifyPhotoZone = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, productId, description, imageUrl } = req.body;
    const createdAt = Date.now();
    try {
        const photoZone = yield todayPhotoZone_model_1.TodayPhotoZone.findOne({ productId: productId });
        if (!photoZone) {
            return res.status(404).json({
                statusCode: -1,
                message: "photoZone not found",
                result: {}
            });
        }
        if (title)
            photoZone.title = title;
        if (productId)
            photoZone.productId = productId;
        if (description)
            photoZone.description = description;
        if (imageUrl)
            photoZone.imageUrl = imageUrl;
        photoZone.createdAt = createdAt;
        yield photoZone.save();
        res.status(200).json({
            statusCode: 0,
            message: "Success",
            result: photoZone
        });
        logger_1.default.info("Successfully modify photozone");
    }
    catch (error) {
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {}
        });
        logger_1.default.error(`Error modify photozone: ${error}`);
    }
});
exports.modifyPhotoZone = modifyPhotoZone;
const getTodayGuidelines = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const guidelines = yield todayGuideline_model_1.TodayGuideline.find();
        res.status(200).json({
            statusCode: 0,
            message: "Success",
            result: guidelines
        });
        logger_1.default.info("Successfully get guidelines");
    }
    catch (error) {
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {}
        });
        logger_1.default.error(`Error get guidelines: ${error}`);
    }
});
exports.getTodayGuidelines = getTodayGuidelines;
const uploadGuideline = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, productId, description, imageUrl } = req.body;
        const createdAt = Date.now();
        const guideline = new todayGuideline_model_1.TodayGuideline({
            title: title,
            createdAt: createdAt,
            productId: productId,
            description: description,
            imageUrl: imageUrl
        });
        yield guideline.save();
        res.status(200).json({
            statusCode: 0,
            message: "Successfully upload guideline",
            result: guideline
        });
    }
    catch (error) {
        logger_1.default.error('Error upload guideline:', error);
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {}
        });
    }
});
exports.uploadGuideline = uploadGuideline;
const modifyGuideline = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, productId, description, imageUrl } = req.body;
    const createdAt = Date.now();
    try {
        const guideline = yield todayGuideline_model_1.TodayGuideline.findOne({ productId: productId });
        if (!guideline) {
            return res.status(404).json({
                statusCode: -1,
                message: "guideline not found",
                result: {}
            });
        }
        if (title)
            guideline.title = title;
        if (productId)
            guideline.productId = productId;
        if (description)
            guideline.description = description;
        if (imageUrl)
            guideline.imageUrl = imageUrl;
        guideline.createdAt = createdAt;
        yield guideline.save();
        res.status(200).json({
            statusCode: 0,
            message: "Success",
            result: guideline
        });
        logger_1.default.info("Successfully modify guideline");
    }
    catch (error) {
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {}
        });
        logger_1.default.error(`Error modify guideline: ${error}`);
    }
});
exports.modifyGuideline = modifyGuideline;

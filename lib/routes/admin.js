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
const contents_1 = require("../models/contents");
const faq_1 = require("../models/faq");
const servserStatus_1 = require("../models/servserStatus");
const auth_1 = require("../models/auth");
const router = express_1.default.Router();
router.post("/status/:code", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const code = req.params.code;
    // code -> 0 = 서버 정상
    // 1 -> 점검중
    // 2 -> 테스트 플라이트 전용
    let currentStatus = yield servserStatus_1.Status.findOne({});
    currentStatus.code = parseInt(code);
    yield (currentStatus === null || currentStatus === void 0 ? void 0 : currentStatus.save());
    res.status(200).send();
}));
router.get("/main/contents", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const type = `${req.query.type}`;
    const result = yield contents_1.Contents.findOne({ type: type }).sort({ _id: -1 });
    if (!result) {
        res.status(404).json({
            error: "Empty content list"
        });
        return;
    }
    res.status(200).json({
        message: "Successfully read content list",
        result: result
    });
}));
router.get("/main/contents/history", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const type = `${req.query.type}`;
    const result = yield contents_1.Contents.find({ type: type }).sort({ _id: -1 });
    if (!result) {
        res.status(404).json({
            error: "Empty content list"
        });
        return;
    }
    res.status(200).json({
        message: "Successfully read content list",
        result: result
    });
}));
router.post("/main/contents", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body);
    const newData = req.body.data;
    console.log(newData);
    const newContents = new contents_1.Contents(newData);
    try {
        yield newContents.save();
    }
    catch (error) {
        console.error("Error while saving contents");
        console.error(error);
        res.status(400).json({
            error: error
        });
    }
    res.status(200).json({
        result: newContents
    });
}));
router.get('/faq/list', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const faqs = yield faq_1.Faq.list();
    res.status(200).json({
        statusCode: 0,
        message: "faqs successfully read.",
        result: faqs
    });
}));
router.post('/faq/answer/:faqId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const faqId = req.params.faqId;
    const { title, content } = req.body;
    const answerData = {
        faqId, title, content, createdAt: Date.now()
    };
    const newAnswer = yield faq_1.FaqAnswer.create(answerData);
    res.status(200).json({
        statusCode: 0,
        message: "Answer successfully uploaded",
        result: newAnswer
    });
}));
router.post("/authorize", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const type = `${req.body.type}`;
    const productId = `${req.body.productId}`;
    const code = `${req.body.code}`;
    const message = req.body.message;
    if (!type || !productId || !code || !message) {
        res.status(200).json({
            statusCode: -1,
            message: "essential data not found.",
            result: {}
        });
        return;
    }
    try {
        const result = yield auth_1.Auth.findOneAndUpdate({ productId }, { code, lastAt: Date.now(), message }, { new: true });
        res.status(200).json({
            statusCode: 0,
            message: "Success",
            result
        });
    }
    catch (error) {
        res.status(200).json({
            statusCode: -1,
            message: error,
            result: {}
        });
    }
}));
exports.default = router;

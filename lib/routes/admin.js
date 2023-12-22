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
const guideline_1 = require("../models/guideline");
const contents_1 = require("../models/contents");
const faq_1 = require("../models/faq");
const servserStatus_1 = require("../models/servserStatus");
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
    const status = `${req.body.status}`;
    if (!type || !productId || !status) {
        res.status(400).json({
            error: "essential data not found."
        });
        return;
    }
    if (type === "Filter") {
        const filter = yield filter_1.Filter.getFromObjId(productId);
        if (!filter) {
            res.status(404).json({
                error: "filter not found."
            });
            return;
        }
        let result = {};
        try {
            result = yield filter.save();
        }
        catch (error) {
            console.error("error while save filter.");
            console.error(error);
            res.status(401).json({
                error: error
            });
        }
        console.log(result);
        res.status(200).json({
            message: "successfully changed.",
            result: result
        });
        return;
    }
    else if (type === "Guideline") {
        const guideline = yield guideline_1.Guideline.getFromObjId(productId);
        if (!guideline) {
            res.status(404).json({
                error: "guideline not found."
            });
            return;
        }
        let result = {};
        try {
            result = yield guideline.save();
        }
        catch (error) {
            console.error("error while save filter.");
            console.error(error);
            res.status(401).json({
                error: error
            });
        }
        console.log(result);
        res.status(200).json({
            message: "successfully changed.",
            result: result
        });
        return;
    }
    else {
        res.status(401).json({
            error: "no exact type you sent."
        });
        return;
    }
}));
exports.default = router;

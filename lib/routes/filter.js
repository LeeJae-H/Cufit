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
const contents_1 = require("../models/contents");
const router = express_1.default.Router();
// authorization
const auth = {
    UNAUTHORIZED: "unauthorized",
    DENIED: "denied",
    AUTHORIZED: "authorized"
};
router.post('/upload', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const title = req.body.title;
    const createdAt = Date.now();
    const tagsString = req.body.tags;
    const authStatus = auth.UNAUTHORIZED;
    const shortDescription = req.body.shortDescription;
    const description = req.body.description;
    const credit = req.body.credit;
    const creatorUid = req.body.creatorUid;
    const adjustment = req.body.adjustment;
    const originalImageUrl = req.body.originalImageUrl;
    const filteredImageUrl = req.body.filteredImageUrl;
    if (!title || !tagsString || !shortDescription || !description || !credit || !creatorUid || !adjustment || !originalImageUrl || !filteredImageUrl) {
        res.status(400).json({
            error: "essential data not found."
        });
        return;
    }
    console.log(adjustment);
    let adjustmentObject;
    try {
        adjustmentObject = JSON.parse(adjustment);
    }
    catch (error) {
        console.error("error while parsing adjustment.");
        console.error(error);
        res.status(400).json({
            error: error
        });
    }
    const newFilter = new filter_1.Filter({
        title: title,
        type: "Filter",
        createdAt: createdAt,
        credit: parseInt(credit),
        tags: tagsString.split(','),
        shortDescription,
        description,
        authStatus,
        creatorUid,
        adjustment: adjustmentObject,
        originalImageUrl: originalImageUrl,
        filteredImageUrl: filteredImageUrl
    });
    try {
        const result = yield newFilter.save();
        res.json({
            statusCode: 0,
            message: "successfully uploaded!",
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
router.get("/main", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const contents = yield contents_1.Contents.findOne({ type: "Filter" }).sort({ _id: -1 });
    const list = (_a = contents === null || contents === void 0 ? void 0 : contents.list) !== null && _a !== void 0 ? _a : [];
    let result = [];
    for (var item of list) {
        const tag = item.t;
        const sortBy = item.b;
        const sort = item.s;
        const filters = yield filter_1.Filter.getListFromTagWithSort(tag, sortBy, sort, auth.AUTHORIZED);
        const data = {
            title: item.d,
            tag: tag,
            list: filters
        };
        result.push(data);
    }
    let top = yield filter_1.Filter.top5();
    res.status(200).json({
        message: "Successfully read main contents.",
        top: top,
        contents: result
    });
}));
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    const count = (_b = parseInt(`${req.query.count}`)) !== null && _b !== void 0 ? _b : 50;
    const authStatus = (_c = `${req.query.authStatus}`) !== null && _c !== void 0 ? _c : auth.AUTHORIZED;
    try {
        const result = yield filter_1.Filter.find({ authStatus: authStatus }).sort({ _id: -1 }).limit(count);
        res.status(200).json({
            result
        });
    }
    catch (error) {
        console.error("error in find all.");
        console.error(error);
        res.status(401).json({
            error: error
        });
    }
}));
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _id = req.params.id;
    try {
        const result = yield filter_1.Filter.getFromObjId(_id);
        res.status(200).json({
            result
        });
    }
    catch (error) {
        console.error("error in find by _id.");
        console.error(error);
        res.status(401).json({
            error: error
        });
    }
}));
router.get("/cid/:cid", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    const cid = req.params.cid;
    const authStatus = (_d = `${req.query.authStatus}`) !== null && _d !== void 0 ? _d : auth.AUTHORIZED;
    try {
        const result = yield filter_1.Filter.getListFromCreatorId(cid, authStatus);
        res.status(200).json({
            result
        });
    }
    catch (error) {
        console.error("error in find by uid.");
        console.error(error);
        res.status(401).json({
            error: error
        });
    }
}));
router.get("/uid/:uid", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const uid = req.params.uid;
    try {
        const result = yield filter_1.Filter.getListFromCreatorUid(uid, auth.AUTHORIZED);
        res.status(200).json({
            result
        });
    }
    catch (error) {
        console.error("error in find by uid.");
        console.error(error);
        res.status(401).json({
            error: error
        });
    }
}));
router.get("/tag/:tag", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    const tag = req.params.tag.toLowerCase();
    const authStatus = (_e = `${req.query.authStatus}`) !== null && _e !== void 0 ? _e : auth.AUTHORIZED;
    try {
        const result = yield filter_1.Filter.getListFromTag(tag, authStatus);
        res.status(200).json({
            result
        });
    }
    catch (error) {
        console.error("error in find by tag.");
        console.error(error);
        res.status(401).json({
            error: error
        });
    }
}));
router.get("/search/:keyword", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const keyword = req.params.keyword.toLowerCase();
    const sort = `${req.query.sort}`;
    const sortby = `${req.query.sortby}`;
    const cost = `${req.query.cost}`;
    if (!keyword || !sort || !sortby || !cost) {
        res.status(201).json({
            message: "essential data not found"
        });
        return;
    }
    const result = yield filter_1.Filter.search(keyword, sort, sortby, cost);
    res.status(200).json({
        result
    });
}));
exports.default = router;

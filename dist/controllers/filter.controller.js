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
exports.getFilterByKeyword = exports.getFilterByUid = exports.getFilterByCreatorId = exports.getFilterById = exports.getFilterTop5 = exports.uploadFilter = void 0;
const filter_model_1 = require("../models/filter.model");
const contents_model_1 = require("../models/contents.model");
const auth_model_1 = require("../models/auth.model");
const mongoose_1 = __importDefault(require("mongoose"));
const uploadFilter = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const title = req.body.title;
    const createdAt = Date.now();
    const tagsString = req.body.tags;
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
    const newFilter = new filter_model_1.Filter({
        title: title,
        type: "Filter",
        createdAt: createdAt,
        credit: parseInt(credit),
        tags: tagsString.split(','),
        shortDescription,
        description,
        creatorUid,
        adjustment: adjustmentObject,
        originalImageUrl: originalImageUrl,
        filteredImageUrl: filteredImageUrl
    });
    const newAuthStatus = new auth_model_1.Auth({
        productId: newFilter._id,
        productType: 'Filter',
        code: 'unauthorized',
        message: 'In process....',
        createdAt: createdAt,
        lastAt: createdAt
    });
    const session = yield mongoose_1.default.startSession();
    try {
        session.startTransaction();
        const result = yield newFilter.save({ session });
        yield newAuthStatus.save({ session });
        yield session.commitTransaction();
        res.json({
            statusCode: 0,
            message: "successfully uploaded!",
            result
        });
    }
    catch (error) {
        yield session.abortTransaction();
        console.error(error);
        res.status(200).json({
            statusCode: -1,
            message: error,
            result: {}
        });
    }
    finally {
        session.endSession();
    }
});
exports.uploadFilter = uploadFilter;
const getFilterTop5 = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const contents = yield contents_model_1.Contents.findOne({ type: "Filter" }).sort({ _id: -1 });
    const list = (_a = contents === null || contents === void 0 ? void 0 : contents.list) !== null && _a !== void 0 ? _a : [];
    let result = [];
    for (var item of list) {
        const tag = item.t;
        const sortBy = item.b;
        const sort = item.s;
        const filters = yield filter_model_1.Filter.getListFromTagWithSort(tag, sortBy, sort);
        const data = {
            title: item.d,
            tag: tag,
            list: filters
        };
        result.push(data);
    }
    let top = yield filter_model_1.Filter.top5();
    res.status(200).json({
        message: "Successfully read main contents.",
        top: top,
        contents: result
    });
});
exports.getFilterTop5 = getFilterTop5;
const getFilterById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _id = req.params.id;
    try {
        const result = yield filter_model_1.Filter.getFromObjId(_id);
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
});
exports.getFilterById = getFilterById;
const getFilterByCreatorId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cid = req.params.cid;
    try {
        const result = yield filter_model_1.Filter.getListFromCreatorId(cid);
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
});
exports.getFilterByCreatorId = getFilterByCreatorId;
const getFilterByUid = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const uid = req.params.uid;
    try {
        const result = yield filter_model_1.Filter.getListFromCreatorUid(uid);
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
});
exports.getFilterByUid = getFilterByUid;
const getFilterByKeyword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    const result = yield filter_model_1.Filter.search(keyword, sort, sortby, cost);
    res.status(200).json({
        result
    });
});
exports.getFilterByKeyword = getFilterByKeyword;

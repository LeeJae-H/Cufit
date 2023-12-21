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
const guideline_1 = require("../models/guideline");
const contents_1 = require("../models/contents");
const auth_1 = require("../models/auth");
const mongoose_1 = __importDefault(require("mongoose"));
const router = express_1.default.Router();
router.post('/upload', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const title = req.body.title;
    const createdAt = Date.now();
    const tagsString = req.body.tags;
    const shortDescription = req.body.shortDescription;
    const description = req.body.description;
    const credit = req.body.credit;
    const creatorUid = req.body.creatorUid;
    const originalImageUrl = req.body.originalImageUrl;
    const guidelineImageUrl = req.body.guidelineImageUrl;
    const placeName = req.body.placeName; // nullable
    const locationString = req.body.location;
    if (!title || !tagsString || !shortDescription || !description || !credit || !creatorUid || !originalImageUrl || !guidelineImageUrl) {
        res.status(200).json({
            statusCode: -1,
            message: "essential data not found.",
            result: {}
        });
        return;
    }
    let location = {};
    if (locationString) {
        location = JSON.parse(locationString);
    }
    else {
        location = {
            type: "Point",
            coordinates: [0, 0]
        };
    }
    const newGuideline = new guideline_1.Guideline({
        title: title,
        type: "Guideline",
        createdAt: createdAt,
        credit: parseInt(credit),
        tags: tagsString.split(','),
        shortDescription,
        description,
        creatorUid,
        originalImageUrl: originalImageUrl,
        guidelineImageUrl: guidelineImageUrl,
        placeName: placeName,
        location: location
    });
    const newAuthStatus = new auth_1.Auth({
        productId: newGuideline._id,
        productType: 'Guideline',
        code: 'unauthorized',
        message: 'In process...',
        createdAt: createdAt,
        lastAt: createdAt
    });
    const session = yield mongoose_1.default.startSession();
    try {
        session.startTransaction();
        const result = yield newGuideline.save();
        yield newAuthStatus.save();
        yield session.commitTransaction();
        res.status(200).json({
            statusCode: 0,
            message: "successfully uploaded!",
            result
        });
    }
    catch (error) {
        yield session.abortTransaction();
        res.status(200).json({
            statusCode: -1,
            message: error,
            result: {}
        });
    }
    finally {
        session.endSession();
    }
}));
router.get("/near", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.query.lat || !req.query.lng) {
        res.status(200).json({
            statusCode: -1,
            message: "lat or lng not found.",
            result: {}
        });
    }
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const distanceString = req.query.distance === undefined ? "1000" : `${req.query.distance}`;
    const distance = parseFloat(distanceString);
    const result = yield guideline_1.Guideline.find({
        location: {
            $near: {
                $maxDistance: distance,
                $geometry: {
                    type: "Point",
                    coordinates: [lng, lat]
                }
            }
        }
    })
        .populate('likedCount')
        .populate('wishedCount')
        .populate('usedCount')
        .populate('creator');
    res.status(200).json({
        statusCode: 0,
        message: "Success",
        result
    });
}));
router.get("/main", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const contents = yield contents_1.Contents.findOne({ type: "Guideline" }).sort({ _id: -1 });
    const list = (_a = contents === null || contents === void 0 ? void 0 : contents.list) !== null && _a !== void 0 ? _a : [];
    let result = [];
    for (var item of list) {
        const tag = item.t;
        const sortBy = item.b;
        const sort = item.s;
        const filters = yield guideline_1.Guideline.getListFromTagWithSort(tag, sortBy, sort);
        const data = {
            title: item.d,
            tag: tag,
            list: filters
        };
        result.push(data);
    }
    let top = yield guideline_1.Guideline.top5();
    res.status(200).json({
        message: "Successfully read main contents.",
        top: top,
        contents: result
    });
}));
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _id = req.params.id;
    try {
        const result = yield guideline_1.Guideline.getFromObjId(_id);
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
router.get("/uid/:uid", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const uid = req.params.uid;
    try {
        const result = yield guideline_1.Guideline.getListFromCreatorUid(uid);
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
    const result = yield guideline_1.Guideline.search(keyword, sort, sortby, cost);
    res.status(200).json({
        result
    });
}));
exports.default = router;

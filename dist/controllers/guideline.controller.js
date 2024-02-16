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
exports.getGuidelineByDistance = exports.getGuidelineByKeyword = exports.getGuidelineByUid = exports.getGuidelineById = exports.getGuidelineTop5 = exports.uploadGuideline = void 0;
const guideline_model_1 = require("../models/guideline.model");
const contents_model_1 = require("../models/contents.model");
const auth_model_1 = require("../models/auth.model");
const mongoose_1 = __importDefault(require("mongoose"));
const uploadGuideline = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, shortDescription, description, credit, creatorUid, originalImageUrl, guidelineImageUrl, placeName, // nullable
     } = req.body;
    const tagsString = req.body.tags;
    const locationString = req.body.location;
    const createdAt = Date.now();
    if (!title || !tagsString || !shortDescription || !description || !credit || !creatorUid || !originalImageUrl || !guidelineImageUrl) {
        return res.status(400).json({
            statusCode: -1,
            message: "Lack of essential data",
            result: {}
        });
    }
    try {
        let location = {};
        if (locationString) {
            try {
                location = JSON.parse(locationString);
            }
            catch (error) {
                throw new Error("Error while parsing location");
            }
        }
        else {
            location = {
                type: "Point",
                coordinates: [0, 0]
            };
        }
        const newGuideline = new guideline_model_1.Guideline({
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
        const newAuthStatus = new auth_model_1.Auth({
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
            const result = yield newGuideline.save({ session });
            yield newAuthStatus.save({ session });
            yield session.commitTransaction();
            res.status(200).json({
                statusCode: 0,
                message: "Successfully uploaded",
                result: result
            });
        }
        catch (error) {
            yield session.abortTransaction();
            throw new Error("Failed transaction");
        }
        finally {
            session.endSession();
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
exports.uploadGuideline = uploadGuideline;
const getGuidelineTop5 = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const contents = yield contents_model_1.Contents.getGuidelineContents();
        const list = (_a = contents === null || contents === void 0 ? void 0 : contents.list) !== null && _a !== void 0 ? _a : [];
        let result = [];
        for (var item of list) {
            const tag = item.t;
            const sortBy = item.b;
            const sort = item.s;
            const filters = yield guideline_model_1.Guideline.getListFromTagWithSort(tag, sortBy, sort);
            const data = {
                title: item.d,
                tag: tag,
                list: filters
            };
            result.push(data);
        }
        let top = yield guideline_model_1.Guideline.top5();
        res.status(200).json({
            statusCode: 0,
            message: "Successfully read main contents",
            result: {
                top: top,
                contents: result
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
exports.getGuidelineTop5 = getGuidelineTop5;
const getGuidelineById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _id = req.params.id;
    try {
        const result = yield guideline_model_1.Guideline.getFromObjId(_id);
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
exports.getGuidelineById = getGuidelineById;
const getGuidelineByUid = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const uid = req.params.uid;
    try {
        const result = yield guideline_model_1.Guideline.getListFromCreatorUid(uid);
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
exports.getGuidelineByUid = getGuidelineByUid;
const getGuidelineByKeyword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const keyword = req.params.keyword.toLowerCase();
    const sort = `${req.query.sort}`;
    const sortby = `${req.query.sortby}`;
    const cost = `${req.query.cost}`;
    if (!keyword || !sort || !sortby || !cost) {
        return res.status(400).json({
            statusCode: -1,
            message: "Lack of essential data",
            result: {}
        });
    }
    try {
        const result = yield guideline_model_1.Guideline.search(keyword, sort, sortby, cost);
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
exports.getGuidelineByKeyword = getGuidelineByKeyword;
const getGuidelineByDistance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.query.lat || !req.query.lng) {
        return res.status(400).json({
            statusCode: -1,
            message: "Lack of essential data",
            result: {}
        });
    }
    try {
        const lat = parseFloat(req.query.lat);
        const lng = parseFloat(req.query.lng);
        const distanceString = req.query.distance === undefined ? "1000" : `${req.query.distance}`;
        const distance = parseFloat(distanceString);
        const result = yield guideline_model_1.Guideline.findByDistance(lat, lng, distance);
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
exports.getGuidelineByDistance = getGuidelineByDistance;

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
exports.getDetail = exports.searchPhotozones = exports.getPhotozoneByDistance = exports.updatePhotozone = exports.deletePhotozone = exports.uploadPhotozone = void 0;
const photoZone_model_1 = require("../models/photoZone.model");
const user_model_1 = require("../models/user.model");
const logger_1 = __importDefault(require("../config/logger"));
const mongoose_1 = __importDefault(require("mongoose"));
const follow_model_1 = require("../models/follow.model");
const like_model_1 = require("../models/like.model");
const wish_model_1 = require("../models/wish.model");
const viewCount_model_1 = require("../models/viewCount.model");
const uploadPhotozone = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { uid, title, placeName, location, description, shortDescription, imageUrls, tags, } = req.body;
        const createdAt = Date.now();
        var locationJSON = {};
        try {
            locationJSON = JSON.parse(location);
        }
        catch (error) {
            throw new Error("Error while parsing location");
        }
        const newPhotoZone = new photoZone_model_1.PhotoZone({
            uid,
            title,
            placeName,
            location: locationJSON,
            description,
            shortDescription,
            imageUrls: imageUrls.split(','),
            tags: tags.split(','),
            createdAt
        });
        yield newPhotoZone.save();
        res.status(200).json({
            statusCode: 0,
            message: "Successfully upload photozone",
            result: newPhotoZone
        });
    }
    catch (error) {
        logger_1.default.error('Error uploading photo zone:', error);
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {}
        });
    }
});
exports.uploadPhotozone = uploadPhotozone;
const deletePhotozone = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uid = req.uid;
        const photoZoneId = req.params.id;
        if (!mongoose_1.default.Types.ObjectId.isValid(photoZoneId)) {
            throw new Error('Invalid photoZoneId');
        }
        const findPhotoZone = yield photoZone_model_1.PhotoZone.findById(photoZoneId);
        if (!findPhotoZone) {
            throw new Error('photozone not found');
        }
        else if (findPhotoZone.uid = uid) {
            yield photoZone_model_1.PhotoZone.deleteOne({ _id: photoZoneId });
        }
        res.status(200).json({
            statusCode: 0,
            message: "Successfully delete photozone",
            result: {}
        });
    }
    catch (error) {
        logger_1.default.error('Error deleting photo zone:', error);
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {}
        });
    }
});
exports.deletePhotozone = deletePhotozone;
const updatePhotozone = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uid = req.uid;
        const updateData = req.body;
        const updatedPhotoZone = yield photoZone_model_1.PhotoZone.findOneAndUpdate({ uid: uid }, updateData, { new: true } // 옵션: 업데이트 후의 문서 반환 여부 -> updatedPhotoZone 변수에 업데이트 후의 문서가 할당됨
        );
        res.status(200).json({
            statusCode: 0,
            message: "Successfully update photozone",
            result: updatedPhotoZone
        });
    }
    catch (error) {
        logger_1.default.error('Error updating photo zone:', error);
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {}
        });
    }
});
exports.updatePhotozone = updatePhotozone;
const getPhotozoneByDistance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.query.lat || !req.query.lng) {
        logger_1.default.error("Lack of essential data");
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
        const result = yield photoZone_model_1.PhotoZone.findByDistance(lat, lng, distance);
        res.status(200).json({
            statusCode: 0,
            message: "Success",
            result: result
        });
        logger_1.default.info("Successfully get photozone by distance");
    }
    catch (error) {
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {}
        });
        logger_1.default.error(`Error get photozone by distance: ${error}`);
    }
});
exports.getPhotozoneByDistance = getPhotozoneByDistance;
const searchPhotozones = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const keyword = req.params.keyword;
        const photozones = yield photoZone_model_1.PhotoZone.searchByKeyword(keyword);
        res.status(200).json({
            statusCode: 0,
            message: "Success search photozones",
            result: {
                photozones: photozones
            }
        });
        logger_1.default.info("Successfully search photozones");
    }
    catch (error) {
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {}
        });
        logger_1.default.error(`Error search photozones: ${error}`);
    }
});
exports.searchPhotozones = searchPhotozones;
const getDetail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uid = `${req.query.uid}`;
        const cid = `${req.query.cid}`;
        const type = `${req.query.type}`;
        const photoZoneId = req.params.photoZoneId;
        if (!photoZoneId || !type) {
            logger_1.default.error("Lack of essential data");
            return res.status(400).json({
                statusCode: -1,
                message: "Lack of essential data",
                result: {}
            });
        }
        const view = new viewCount_model_1.ViewCount({
            productId: photoZoneId,
            productType: type,
            uid: uid,
            createdAt: Date.now()
        });
        yield view.save();
        const creator = yield user_model_1.User.getFromUid(cid);
        if (!uid || uid === "") {
            return res.status(200).json({
                statusCode: 0,
                message: "Success",
                result: {
                    creator: creator,
                    isFollowed: false,
                    isLiked: false,
                    isWished: false,
                }
            });
        }
        let isFollowed = yield follow_model_1.Follow.isFollowed(uid, cid);
        let isLiked = yield like_model_1.Like.isExist(photoZoneId, uid, type);
        let isWished = yield wish_model_1.Wish.isExist(photoZoneId, uid, type);
        res.status(200).json({
            statusCode: 0,
            message: "Success",
            result: {
                creator: creator,
                isFollowed,
                isLiked,
                isWished
            }
        });
        logger_1.default.info("Successfully get detail");
    }
    catch (error) {
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {}
        });
        logger_1.default.error(`Error get detail: ${error}`);
    }
});
exports.getDetail = getDetail;

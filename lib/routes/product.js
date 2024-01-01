"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const mongoose_1 = __importDefault(require("mongoose"));
const user_1 = require("../models/user");
const follow_1 = require("../models/follow");
const like_1 = require("../models/like");
const wish_1 = require("../models/wish");
const order_1 = require("../models/order");
const filter_1 = require("../models/filter");
const guideline_1 = require("../models/guideline");
const review_1 = require("../models/review");
const credit_1 = require("../models/credit");
const admin = __importStar(require("firebase-admin"));
// router 객체
const router = express_1.default.Router();
router.post('/like', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const productId = req.body.productId;
    const uid = req.body.uid;
    const type = req.body.type;
    const createdAt = Date.now();
    let isLiked = yield like_1.Like.isExist(productId, uid, type);
    if (type === "Filter") {
        if (isLiked) {
            yield like_1.Like.deleteOne({ productId: productId, uid: uid, productType: type });
            res.status(200).json({
                result: false
            });
            return;
        }
        else {
            const like = new like_1.Like({
                productId: productId,
                uid: uid,
                productType: type,
                createdAt: createdAt
            });
            yield like.save();
            res.status(200).json({
                result: true
            });
            return;
        }
    }
    else if (type === "Guideline") {
        if (isLiked) {
            yield like_1.Like.deleteOne({ productId: productId, uid: uid, productType: type });
            res.status(200).json({
                result: false
            });
            return;
        }
        else {
            const like = new like_1.Like({
                productId: new mongoose_1.default.Types.ObjectId(productId),
                uid: uid,
                productType: type,
                createdAt: createdAt
            });
            yield like.save();
            res.status(200).json({
                result: true
            });
            return;
        }
    }
    else {
        res.status(201).json({
            message: "type needed"
        });
        return;
    }
}));
router.post('/wish', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const productId = req.body.productId;
    const uid = req.body.uid;
    const type = req.body.type;
    const createdAt = Date.now();
    let isWished = yield wish_1.Wish.isExist(productId, uid, type);
    if (type === "Filter") {
        if (isWished) {
            yield wish_1.Wish.deleteOne({ productId: productId, uid: uid, productType: type });
            res.status(200).json({
                result: false
            });
            return;
        }
        else {
            const wish = new wish_1.Wish({
                productId: productId,
                uid: uid,
                productType: type,
                createdAt: createdAt
            });
            yield wish.save();
            res.status(200).json({
                result: true
            });
            return;
        }
    }
    else if (type === 'Guideline') {
        if (isWished) {
            yield wish_1.Wish.deleteOne({ productId: productId, uid: uid, productType: type });
            res.status(200).json({
                result: false
            });
            return;
        }
        else {
            const wish = new wish_1.Wish({
                productId: productId,
                uid: uid,
                productType: type,
                createdAt: createdAt
            });
            yield wish.save();
            res.status(200).json({
                result: true
            });
            return;
        }
    }
    else {
        res.status(201).json({
            message: "type needed"
        });
        return;
    }
}));
router.get("/review/:productId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const productId = req.params.productId;
    const reviews = yield review_1.Review.find({ productId })
        .populate('user');
    res.status(200).json({
        statusCode: 0,
        message: "Success",
        result: reviews
    });
}));
router.post("/review/:productId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const productId = req.params.productId;
    const idToken = req.body.idToken;
    const productType = req.body.productType;
    const stars = req.body.stars;
    const comment = req.body.comment;
    const imageUrl = req.body.imageUrl;
    const session = yield mongoose_1.default.startSession();
    try {
        const decodedToken = yield admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;
        const currentTime = Date.now();
        session.startTransaction();
        const existReview = yield review_1.Review.findOne({ uid, productId });
        if (existReview) {
            console.log(existReview);
            res.status(200).json({
                statusCode: 1,
                message: "Review already submitted.",
                result: existReview
            });
            return;
        }
        const review = new review_1.Review({
            uid: uid,
            imageUrl: imageUrl,
            stars: stars,
            productId: new mongoose_1.default.Types.ObjectId(productId),
            productType: productType,
            comment: comment,
            createdAt: currentTime
        });
        const creditInfo = {
            uid: uid,
            amount: 1,
            createdAt: currentTime,
            expireAt: -1,
            creditType: "REVIEW"
        };
        const newCredit = new credit_1.Credit(creditInfo);
        const newTransaction = new credit_1.CreditTransaction({
            creditId: newCredit._id,
            amount: 1,
            createdAt: currentTime,
            transactionType: "REVIEW_REWARD"
        });
        yield review.save({ session });
        yield newCredit.save({ session });
        yield newTransaction.save({ session });
        session.commitTransaction();
        const resultUser = yield user_1.User.getFromUid(uid);
        res.status(200).json({
            statusCode: 0,
            message: "Review saved.",
            result: {
                user: resultUser,
                review
            }
        });
    }
    catch (error) {
        session.abortTransaction();
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
}));
router.get("/detail/:productId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const uid = `${req.query.uid}`;
    const cid = `${req.query.cid}`;
    const type = `${req.query.type}`;
    const productId = req.params.productId;
    let avgRating = 0;
    let reviewCount = 0;
    let latestReviews = [];
    if (!cid || !productId || !type) {
        res.status(401).json({
            error: "no essential data."
        });
        return;
    }
    let user;
    try {
        const tUser = yield user_1.User.getFromUid(cid);
        const salingFilters = yield filter_1.Filter.getListFromCreatorUid(tUser.uid);
        const salingGuidelines = yield guideline_1.Guideline.getListFromCreatorUid(tUser.uid);
        const reviews = yield review_1.Review.find({ productId: productId }).populate('user');
        console.log("review count =", reviews.length);
        console.log(reviews);
        let totalRating = 0;
        reviews.forEach(review => totalRating = totalRating + review.stars);
        if (reviews.length > 0) {
            avgRating = totalRating / reviews.length;
        }
        latestReviews = reviews.splice(0, 5);
        reviewCount = reviews.length;
        console.log("reviewCount =", reviewCount, "reviews length =", reviews.length);
        user = tUser;
        user.salingFilters = salingFilters;
        user.salingGuidelines = salingGuidelines;
    }
    catch (error) {
        console.error("error while find creator info.");
        console.error(error);
        res.status(400).json({
            error: error
        });
    }
    if (!uid || uid === "") {
        res.status(200).json({
            statusCode: 0,
            message: "Success",
            result: {
                creator: user,
                isFollowed: false,
                isLiked: false,
                isWished: false,
                isPurchased: false,
                rating: avgRating,
                reviewCount,
                latestReviews: latestReviews
            }
        });
        return;
    }
    let isFollowed = yield follow_1.Follow.isFollowed(uid, cid);
    let isLiked = yield like_1.Like.isExist(productId, uid, type);
    let isWished = yield wish_1.Wish.isExist(productId, uid, type);
    let isPurchased = yield order_1.Order.isExist(productId, uid, type);
    let review = yield review_1.Review.findOne({ uid, productId });
    res.status(200).json({
        statusCode: 0,
        message: "Success",
        result: {
            creator: user,
            isFollowed,
            isLiked,
            isWished,
            isPurchased,
            review,
            rating: avgRating,
            reviewCount,
            latestReviews: latestReviews
        }
    });
}));
exports.default = router;

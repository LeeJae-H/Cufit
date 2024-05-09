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
exports.purchaseCredit = exports.getAdreward = exports.getAdrewardAmount = exports.getCreditTransaction = exports.reviewProduct = exports.buyProduct = exports.wishProduct = exports.likeProduct = exports.uploadFaq = exports.toggleFollow = exports.getPurchasedList = exports.getCredits = exports.checkFollow = exports.getWishList = exports.getLikeList = exports.getProductList = exports.getFaqList = exports.getFollowingList = exports.getFollowerList = exports.deleteUser = exports.updateUserProfile = exports.getUserProfile = exports.login = void 0;
const admin = __importStar(require("firebase-admin"));
const user_model_1 = require("../models/user.model");
const faq_model_1 = require("../models/faq.model");
const follow_model_1 = require("../models/follow.model");
const guideline_model_1 = require("../models/guideline.model");
const filter_model_1 = require("../models/filter.model");
const review_model_1 = require("../models/review.model");
const wish_model_1 = require("../models/wish.model");
const like_model_1 = require("../models/like.model");
const credit_model_1 = require("../models/credit.model");
const mongoose_1 = __importDefault(require("mongoose"));
const adReward = 1;
const axios_1 = __importDefault(require("axios"));
const order_model_1 = require("../models/order.model");
const income_model_1 = require("../models/income.model");
const logger_1 = __importDefault(require("../config/logger"));
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idToken } = req.body;
    try {
        const decodedToken = yield admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;
        let userData = yield user_model_1.User.getFromUid(uid);
        if (!userData) {
            userData = yield user_model_1.User.createNewUser(decodedToken);
        }
        res.status(200).json({
            statusCode: 0,
            message: "Successfully login",
            result: userData
        });
        logger_1.default.info('Successfully login');
    }
    catch (error) {
        res.status(500).json({
            statusCode: -1,
            message: error, // error.message
            result: {}
        });
        logger_1.default.error(`Error login: ${error}`);
    }
});
exports.login = login;
const getUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const uid = req.params.uid;
    try {
        const user = yield user_model_1.User.getFromUid(uid); // 데이터베이스에서 uid 조회
        if (user) {
            res.status(200).json({
                statusCode: 0,
                message: "Success",
                user: user
            });
        }
        else {
            res.status(400).json({
                statusCode: -1,
                message: "User not found",
                result: {}
            });
        }
        logger_1.default.info('Successfully get user profile');
    }
    catch (error) {
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {}
        });
        logger_1.default.error(`Error get user profile: ${error}`);
    }
});
exports.getUserProfile = getUserProfile;
const updateUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const uid = req.uid;
    const { bio, displayName, instagramName, tiktokName, youtubeName, photoURL } = req.body;
    const newUserData = {
        bio: bio,
        displayName: displayName,
        instagramName: instagramName,
        tiktokName: tiktokName,
        youtubeName: youtubeName,
        photoURL: photoURL
    };
    try {
        const existingUser = yield user_model_1.User.findOne({ displayName: displayName });
        if (existingUser && existingUser.uid !== uid) {
            return res.status(400).json({
                statusCode: -1,
                message: "DisplayName is already existed",
                result: {}
            });
        }
        yield user_model_1.User.findOneAndUpdate({ uid: uid }, { $set: newUserData }); // 데이터베이스에서 uid 조회
        const result = yield user_model_1.User.getFromUid(uid);
        res.status(200).json({
            statusCode: 0,
            message: "Successfully updated",
            result: result
        });
        logger_1.default.info('Successfully update user profile');
    }
    catch (error) {
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {}
        });
        logger_1.default.error(`Error update user profile: ${error}`);
    }
});
exports.updateUserProfile = updateUserProfile;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const uid = req.uid;
    try {
        yield admin.auth().deleteUser(uid);
        yield user_model_1.User.deleteOne({ uid });
        res.status(200).json({
            statusCode: 0,
            message: "Successfully deleted",
            result: {}
        });
        logger_1.default.info('Successfully delete user');
    }
    catch (error) {
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {}
        });
        logger_1.default.error(`Error delete user: ${error}`);
    }
});
exports.deleteUser = deleteUser;
const getFollowerList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const uid = req.params.uid;
    try {
        const followerList = yield follow_model_1.Follow.getFollowerList(uid);
        res.status(200).json({
            statusCode: 0,
            message: "Success",
            result: followerList
        });
        logger_1.default.info('Successfully get follower list');
    }
    catch (error) {
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {}
        });
        logger_1.default.error(`Error get follower list: ${error}`);
    }
});
exports.getFollowerList = getFollowerList;
const getFollowingList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const uid = req.params.uid;
    try {
        const followingList = yield follow_model_1.Follow.getFollowingList(uid);
        res.status(200).json({
            statusCode: 0,
            message: "Success",
            result: followingList
        });
        logger_1.default.info('Successfully get following list');
    }
    catch (error) {
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {}
        });
        logger_1.default.error(`Error get following list: ${error}`);
    }
});
exports.getFollowingList = getFollowingList;
const getFaqList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const uid = req.params.uid;
    try {
        const result = yield faq_model_1.Faq.getFromUid(uid);
        res.status(200).json({
            statusCode: 0,
            message: "Success",
            result: result
        });
        logger_1.default.info('Successfully get faq list');
    }
    catch (error) {
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {}
        });
        logger_1.default.error(`Error get faq list: ${error}`);
    }
});
exports.getFaqList = getFaqList;
const getProductList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const uid = req.params.uid;
    try {
        const filters = yield filter_model_1.Filter.getListFromCreatorUid(uid);
        const guidelines = yield guideline_model_1.Guideline.getListFromCreatorUid(uid);
        res.status(200).json({
            statusCode: 0,
            message: "Successfully read product list",
            result: {
                filters: filters,
                guidelines: guidelines
            }
        });
        logger_1.default.info('Successfully get product list');
    }
    catch (error) {
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {
                filters: [],
                guidelines: []
            }
        });
        logger_1.default.error(`Error get product list: ${error}`);
    }
});
exports.getProductList = getProductList;
const getLikeList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const uid = req.params.uid;
    try {
        const likelistData = yield like_model_1.Like.getLikelist(uid);
        res.status(200).json({
            statusCode: 0,
            message: 'Successfully read likelist',
            result: {
                filters: likelistData.filters,
                guidelines: likelistData.guidelines,
            }
        });
        logger_1.default.info('Successfully get like list');
    }
    catch (error) {
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {
                filters: [],
                guidelines: []
            }
        });
        logger_1.default.error(`Error get like list: ${error}`);
    }
});
exports.getLikeList = getLikeList;
const getWishList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const uid = req.params.uid;
    try {
        const wishlistData = yield wish_model_1.Wish.getWishlist(uid);
        res.status(200).json({
            statusCode: 0,
            message: 'Successfully read wishlist',
            result: {
                filters: wishlistData.filters,
                guidelines: wishlistData.guidelines,
            }
        });
        logger_1.default.info('Successfully get wish list');
    }
    catch (error) {
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {
                filters: [],
                guidelines: []
            }
        });
        logger_1.default.error(`Error get wish list: ${error}`);
    }
});
exports.getWishList = getWishList;
const checkFollow = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const srcUid = req.query.src;
    const dstUid = req.query.dst;
    try {
        const srcExist = yield user_model_1.User.exists({ uid: srcUid });
        const dstExist = yield user_model_1.User.exists({ uid: dstUid });
        if (!srcExist) {
            logger_1.default.error("User not found for provided source uid");
            return res.status(400).json({
                statusCode: -1,
                message: "User not found for provided source uid",
                result: {}
            });
        }
        if (!dstExist) {
            logger_1.default.error("User not found for provided destination uid");
            return res.status(400).json({
                statusCode: -1,
                message: "User not found for provided destination uid",
                result: {}
            });
        }
        const result = yield follow_model_1.Follow.isFollowed(srcUid, dstUid);
        const followMessage = result ? "Successfully followed" : "Successfully unfollowed";
        const isFollowed = result ? true : false;
        res.status(200).json({
            statusCode: 0,
            message: followMessage,
            result: isFollowed
        });
        logger_1.default.info(followMessage);
    }
    catch (error) {
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {}
        });
        logger_1.default.error(`Error check follow: ${error}`);
    }
});
exports.checkFollow = checkFollow;
const getCredits = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const uid = req.params.uid;
    try {
        const result = yield user_model_1.User.getCredits(uid);
        res.status(200).json({
            statusCode: 0,
            message: "Successfully get credits",
            result
        });
        logger_1.default.info("Successfully get credits");
    }
    catch (error) {
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {}
        });
        logger_1.default.error(`Error check follow: ${error}`);
    }
});
exports.getCredits = getCredits;
const getPurchasedList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const uid = req.params.uid;
    try {
        const result = yield user_model_1.User.getPurchasedGuidelines(uid);
        res.status(200).json({
            statusCode: 0,
            message: "Successfully get purchased guidelines",
            result: {
                guidelines: result
            }
        });
        logger_1.default.info("Successfully get purchased guidelines");
    }
    catch (error) {
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {}
        });
        logger_1.default.error(`Error check follow: ${error}`);
    }
});
exports.getPurchasedList = getPurchasedList;
const toggleFollow = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { srcUid, dstUid } = req.body;
    try {
        const srcExist = yield user_model_1.User.exists({ uid: srcUid });
        const dstExist = yield user_model_1.User.exists({ uid: dstUid });
        if (!srcExist) {
            logger_1.default.error("User not found for provided source uid");
            return res.status(400).json({
                statusCode: -1,
                message: "User not found for provided source uid",
                result: {}
            });
        }
        if (!dstExist) {
            logger_1.default.error("User not found for provided destination uid");
            return res.status(400).json({
                statusCode: -1,
                message: "User not found for provided destination uid",
                result: {}
            });
        }
        const result = yield follow_model_1.Follow.follow(srcUid, dstUid);
        const followMessage = result ? "Successfully followed" : "Successfully unfollowed";
        const isFollowed = result ? true : false;
        res.status(200).json({
            statusCode: 0,
            message: followMessage,
            result: isFollowed,
        });
        logger_1.default.info(followMessage);
    }
    catch (error) {
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {}
        });
        logger_1.default.error(`Error toggle follow: ${error}`);
    }
});
exports.toggleFollow = toggleFollow;
const uploadFaq = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid, title, content, type } = req.body;
    if (!uid || !title || !content || !type) {
        logger_1.default.error("Lack of essential data");
        return res.status(400).json({
            statusCode: -1,
            message: "Lack of essential data",
            result: {}
        });
    }
    try {
        const faqData = {
            uid, title, content, faqType: type, createdAt: Date.now()
        };
        const newFaq = new faq_model_1.Faq(faqData);
        yield newFaq.save();
        res.status(200).json({
            statusCode: 0,
            message: "Successfully upload",
            result: newFaq
        });
        logger_1.default.info("Successfully upload faq");
    }
    catch (error) {
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {}
        });
        logger_1.default.error(`Error upload faq: ${error}`);
    }
});
exports.uploadFaq = uploadFaq;
const likeProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const productId = req.body.productId;
    const uid = req.body.uid;
    const type = req.body.type;
    const createdAt = Date.now();
    try {
        let isLiked = yield like_model_1.Like.isExist(productId, uid, type);
        if (type === "Filter") {
            if (isLiked) {
                yield like_model_1.Like.deleteOne({ productId: productId, uid: uid, productType: type });
                res.status(200).json({
                    statusCode: 0,
                    message: "Successfully filter like deleted",
                    result: false
                });
                logger_1.default.info("Successfully filter like deleted");
            }
            else {
                const like = new like_model_1.Like({
                    productId: productId,
                    uid: uid,
                    productType: type,
                    createdAt: createdAt
                });
                yield like.save();
                res.status(200).json({
                    statusCode: 0,
                    message: "Successfully filter like registed",
                    result: true
                });
                logger_1.default.info("Successfully filter like registed");
            }
        }
        else if (type === "Guideline") {
            if (isLiked) {
                yield like_model_1.Like.deleteOne({ productId: productId, uid: uid, productType: type });
                res.status(200).json({
                    statusCode: 0,
                    message: "Successfully guideline like deleted",
                    result: false
                });
                logger_1.default.info("Successfully guideline like deleted");
            }
            else {
                const like = new like_model_1.Like({
                    productId: new mongoose_1.default.Types.ObjectId(productId),
                    uid: uid,
                    productType: type,
                    createdAt: createdAt
                });
                yield like.save();
                res.status(200).json({
                    statusCode: 0,
                    message: "Successfully guideline like registed",
                    result: true
                });
                logger_1.default.info("Successfully guideline like registed");
            }
        }
        else if (type === "PhotoZone") {
            if (isLiked) {
                yield like_model_1.Like.deleteOne({ productId: productId, uid: uid, productType: type });
                res.status(200).json({
                    statusCode: 0,
                    message: "Successfully photoZone like deleted",
                    result: false
                });
                logger_1.default.info("Successfully photoZone like deleted");
            }
            else {
                const like = new like_model_1.Like({
                    productId: new mongoose_1.default.Types.ObjectId(productId),
                    uid: uid,
                    productType: type,
                    createdAt: createdAt
                });
                yield like.save();
                res.status(200).json({
                    statusCode: 0,
                    message: "Successfully photoZone like registed",
                    result: true
                });
                logger_1.default.info("Successfully photoZone like registed");
            }
        }
    }
    catch (error) {
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {}
        });
        logger_1.default.error(`Error like product: ${error}`);
    }
});
exports.likeProduct = likeProduct;
const wishProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const productId = req.body.productId;
    const uid = req.body.uid;
    const type = req.body.type;
    const createdAt = Date.now();
    try {
        let isWished = yield wish_model_1.Wish.isExist(productId, uid, type);
        if (type === "Filter") {
            if (isWished) {
                yield wish_model_1.Wish.deleteOne({ productId: productId, uid: uid, productType: type });
                res.status(200).json({
                    statusCode: 0,
                    message: "Successfully filter wish deleted",
                    result: false
                });
                logger_1.default.info("Successfully filter wish deleted");
            }
            else {
                const wish = new wish_model_1.Wish({
                    productId: productId,
                    uid: uid,
                    productType: type,
                    createdAt: createdAt
                });
                yield wish.save();
                res.status(200).json({
                    statusCode: 0,
                    message: "Successfully filter wish registed",
                    result: true
                });
                logger_1.default.info("Successfully filter wish registed");
            }
        }
        else if (type === 'Guideline') {
            if (isWished) {
                yield wish_model_1.Wish.deleteOne({ productId: productId, uid: uid, productType: type });
                res.status(200).json({
                    statusCode: 0,
                    message: "Successfully guideline wish deleted",
                    result: false
                });
                logger_1.default.info("Successfully guideline wish deleted");
            }
            else {
                const wish = new wish_model_1.Wish({
                    productId: productId,
                    uid: uid,
                    productType: type,
                    createdAt: createdAt
                });
                yield wish.save();
                res.status(200).json({
                    statusCode: 0,
                    message: "Successfully guideline wish registed",
                    result: true
                });
                logger_1.default.info("Successfully guideline wish registed");
            }
        }
        else if (type === 'photoZone') {
            if (isWished) {
                yield wish_model_1.Wish.deleteOne({ productId: productId, uid: uid, productType: type });
                res.status(200).json({
                    statusCode: 0,
                    message: "Successfully photoZone wish deleted",
                    result: false
                });
                logger_1.default.info("Successfully photoZone wish deleted");
            }
            else {
                const wish = new wish_model_1.Wish({
                    productId: productId,
                    uid: uid,
                    productType: type,
                    createdAt: createdAt
                });
                yield wish.save();
                res.status(200).json({
                    statusCode: 0,
                    message: "Successfully photoZone wish registed",
                    result: true
                });
                logger_1.default.info("Successfully photoZone wish registed");
            }
        }
    }
    catch (error) {
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {}
        });
        logger_1.default.error(`Error wish product: ${error}`);
    }
});
exports.wishProduct = wishProduct;
const buyProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const uid = req.uid;
    const { productId, productType } = req.body;
    try {
        // 이미 구매한 제품인지 확인하는 프로세스
        const existOrder = yield order_model_1.Order.findOne({ uid: uid, productId: productId, productType: productType });
        if (existOrder) {
            logger_1.default.error('User already purchased this product');
            return res.status(400).json({
                statusCode: -1,
                message: "User already purchased this product",
                result: {
                    productId: productId,
                    productType: productType,
                    uid: uid
                }
            });
        }
        let product = {};
        if (productType === "Filter") {
            product = yield filter_model_1.Filter.getFromObjId(productId);
        }
        else if (productType === "Guideline") {
            product = yield guideline_model_1.Guideline.getFromObjId(productId);
        }
        if (!product) {
            throw new Error(`${productId} Product not found.`);
        }
        product = product[0];
        let productPrice = parseInt(`${product.credit}`);
        const currentTime = Date.now();
        let credits = yield credit_model_1.Credit.find({
            uid: uid,
            amount: { $gt: 0 },
            $or: [
                { expireAt: { $gt: currentTime } },
                { expireAt: -1 }
            ]
        }).sort({ expireAt: 1 });
        let transactionObjects = [];
        for (let i = 0; i < credits.length; i++) {
            let credit = credits[i];
            const result = credit.amount - productPrice;
            if (result >= 0) {
                credits[i].amount -= productPrice;
                let transaction = {
                    creditId: credits[i]._id,
                    amount: -productPrice,
                    transactionType: "PURCHASE_PRODUCT",
                    createdAt: currentTime
                };
                transactionObjects.push(transaction);
                productPrice = 0;
                break;
            }
            else {
                productPrice -= credits[i].amount;
                let transaction = {
                    creditId: credits[i]._id,
                    amount: -credits[i].amount,
                    transactionType: "PURCHASE_PRODUCT",
                    createdAt: currentTime
                };
                transactionObjects.push(transaction);
                credits[i].amount = 0;
            }
        }
        if (productPrice > 0) {
            logger_1.default.error('Not enough credits to purchase this product.');
            return res.status(400).json({
                statusCode: -2,
                message: "Not enough credits to purchase this product.",
                result: {
                    credits_of: productPrice
                }
            });
        }
        let orderId = "";
        const session = yield mongoose_1.default.startSession();
        session.startTransaction();
        try {
            for (let credit of credits) {
                yield credit.save({ session });
            }
            for (let data of transactionObjects) {
                const transaction = new credit_model_1.CreditTransaction(data);
                yield transaction.save({ session });
            }
            const order = new order_model_1.Order({
                uid: uid,
                productId: productId,
                productType: productType,
                createdAt: currentTime,
                orderType: "CREDIT"
            });
            yield order.save({ session });
            orderId = `${order._id}`;
            const income = new income_model_1.Income({
                uid: product.creatorUid,
                product: productId,
                productType: productType,
                order: order._id,
                createdAt: currentTime,
                amount: parseInt(`${product.credit}`)
            });
            yield income.save({ session });
            yield session.commitTransaction();
        }
        catch (error) {
            yield session.abortTransaction();
            throw error;
        }
        finally {
            session.endSession();
        }
        const user = yield user_model_1.User.getFromUid(uid);
        res.status(200).json({
            statusCode: 0,
            message: "Successfully purchase product",
            result: {
                user: user,
                productId: productId,
                productPrice: product.credit,
                productType: productType,
                purchasedAt: currentTime,
                orderId: orderId
            }
        });
        logger_1.default.info("Successfully purchase product");
    }
    catch (error) {
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {}
        });
        logger_1.default.error(`Error buy product: ${error}`);
    }
});
exports.buyProduct = buyProduct;
const reviewProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const productId = req.body.productId;
    const uid = req.uid;
    const productType = req.body.productType;
    const stars = req.body.stars;
    const comment = req.body.comment;
    const imageUrl = req.body.imageUrl;
    try {
        const currentTime = Date.now();
        const existReview = yield review_model_1.Review.findOne({ uid, productId });
        if (existReview) {
            throw new Error("Review already submitted");
        }
        const review = new review_model_1.Review({
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
        const newCredit = new credit_model_1.Credit(creditInfo);
        const newTransaction = new credit_model_1.CreditTransaction({
            creditId: newCredit._id,
            amount: 1,
            createdAt: currentTime,
            transactionType: "REVIEW_REWARD"
        });
        const session = yield mongoose_1.default.startSession();
        session.startTransaction();
        try {
            yield review.save({ session });
            yield newCredit.save({ session });
            yield newTransaction.save({ session });
            session.commitTransaction();
            const resultUser = yield user_model_1.User.getFromUid(uid);
            res.status(200).json({
                statusCode: 0,
                message: "Successfully review saved",
                result: {
                    user: resultUser,
                    review: review
                }
            });
            logger_1.default.info("Successfully review product");
        }
        catch (error) {
            session.abortTransaction();
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
        logger_1.default.error(`Error review product: ${error}`);
    }
});
exports.reviewProduct = reviewProduct;
const getCreditTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const uid = req.uid;
    try {
        const credits = yield credit_model_1.Credit.find({ uid: uid });
        const transactions = yield credit_model_1.CreditTransaction.find({ creditId: { $in: credits.map(credit => credit._id) } });
        res.status(200).json({
            statusCode: 0,
            message: "Successfully updated",
            result: transactions
        });
        logger_1.default.info("Successfully get credit transaction");
    }
    catch (error) {
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {}
        });
        logger_1.default.error(`Error get credit transaction: ${error}`);
    }
});
exports.getCreditTransaction = getCreditTransaction;
const getAdrewardAmount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).json({
        statusCode: 0,
        message: "Success",
        result: adReward
    });
    logger_1.default.info("Successfully get adreward amount");
});
exports.getAdrewardAmount = getAdrewardAmount;
const getAdreward = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const uid = req.uid;
    const session = yield mongoose_1.default.startSession();
    try {
        session.startTransaction();
        const currentTime = Date.now();
        const creditInfo = {
            uid: uid,
            amount: adReward,
            createdAt: currentTime,
            expireAt: -1,
            creditType: "AD"
        };
        const newCredit = new credit_model_1.Credit(creditInfo);
        const newTransaction = new credit_model_1.CreditTransaction({
            creditId: newCredit._id,
            amount: adReward,
            createdAt: currentTime,
            transactionType: "AD_REWARD"
        });
        yield newCredit.save({ session });
        yield newTransaction.save({ session });
        yield session.commitTransaction();
        const resultUser = yield user_model_1.User.getFromUid(uid);
        res.status(200).json({
            statusCode: 0,
            message: "Success",
            result: resultUser
        });
        logger_1.default.info("Successfully get adreward");
    }
    catch (error) {
        session.abortTransaction();
        res.status(200).json({
            statusCode: -1,
            message: error,
            result: {}
        });
        logger_1.default.error(`Error get adreward: ${error}`);
    }
    finally {
        session.endSession();
    }
});
exports.getAdreward = getAdreward;
const purchaseCredit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid, atid, receiptData } = req.body;
    try {
        const appleProductionURL = 'https://buy.itunes.apple.com/verifyReceipt'; // Production URL
        const appleSandboxURL = 'https://sandbox.itunes.apple.com/verifyReceipt'; // Sandbox URL
        const password = '71ede09526bb4a599f1e777e1f25c98e';
        const response = yield axios_1.default.post(appleProductionURL, {
            "receipt-data": receiptData,
            "password": password
        });
        const verificationResult = yield response.data;
        if (verificationResult.status === 0) {
            const session = yield mongoose_1.default.startSession();
            session.startTransaction();
            try {
                const existOrder = yield credit_model_1.Credit.find({ uid: uid, atid: atid }).session(session);
                if (existOrder.length > 0) {
                    logger_1.default.error("This transaction already created.");
                    return res.status(400).json({
                        statusCode: -1,
                        message: "This transaction already created.",
                        result: {}
                    });
                }
                const receipts = verificationResult.receipt.in_app;
                const availableReceipts = receipts.filter((element) => {
                    return element.original_transaction_id === atid;
                });
                const amount = parseInt(availableReceipts[0].product_id.split('_').pop());
                const currentTime = Date.now();
                const creditInfo = {
                    uid: uid,
                    amount: amount,
                    createdAt: currentTime,
                    expireAt: -1,
                    atid: atid,
                    creditType: "PURCHASE"
                };
                const newCredit = new credit_model_1.Credit(creditInfo);
                const newTransaction = new credit_model_1.CreditTransaction({
                    creditId: newCredit._id,
                    amount: amount,
                    createdAt: currentTime,
                    transactionType: "PURCHASE_CREDIT"
                });
                yield newCredit.save({ session });
                yield newTransaction.save({ session });
                yield session.commitTransaction();
                res.status(200).json({
                    statusCode: 0,
                    message: 'Successfully credit purchase verified and saved',
                    result: {
                        newCredit: newCredit,
                        newTransaction: newTransaction
                    }
                });
                logger_1.default.info("Successfully purchase credit");
            }
            catch (error) {
                yield session.abortTransaction();
                throw error;
            }
            finally {
                session.endSession();
            }
        }
        else if (verificationResult.status === 21007) { // Sandbox용 결제인 경우 Sandbox URL로 재검증 요청
            const existOrder = yield credit_model_1.Credit.find({ uid: uid, atid: atid });
            if (existOrder.length > 0) {
                logger_1.default.error("This transaction already created.");
                return res.status(400).json({
                    statusCode: -1,
                    message: "This transaction already created.",
                    result: {}
                });
            }
            const sandboxResponse = yield axios_1.default.post(appleSandboxURL, {
                "receipt-data": receiptData,
                "password": password
            });
            const sandboxVerificationResult = yield sandboxResponse.data;
            if (sandboxVerificationResult.status === 0) {
                const session = yield mongoose_1.default.startSession();
                session.startTransaction();
                try {
                    const receipts = sandboxVerificationResult.receipt.in_app;
                    const availableReceipts = receipts.filter((element) => {
                        return element.original_transaction_id === atid;
                    });
                    const amount = parseInt(availableReceipts[0].product_id.split('_').pop());
                    const currentTime = Date.now();
                    const creditInfo = {
                        uid: uid,
                        amount: amount,
                        createdAt: currentTime,
                        expireAt: -1,
                        atid: atid,
                        creditType: "PURCHASE"
                    };
                    const newCredit = new credit_model_1.Credit(creditInfo);
                    const newTransaction = new credit_model_1.CreditTransaction({
                        creditId: newCredit._id,
                        amount: amount,
                        createdAt: currentTime,
                        transactionType: "PURCHASE_CREDIT"
                    });
                    yield newCredit.save({ session });
                    yield newTransaction.save({ session });
                    yield session.commitTransaction();
                    res.status(200).json({
                        statusCode: 0,
                        message: 'Successfully credit purchase verified and saved',
                        result: {
                            newCredit: newCredit,
                            newTransaction: newTransaction
                        }
                    });
                    logger_1.default.info("Successfully purchase credit");
                }
                catch (error) {
                    yield session.abortTransaction();
                    throw new Error("Failed transaction");
                }
                finally {
                    session.endSession();
                }
            }
            else {
                res.status(400).json({
                    statusCode: -1,
                    message: 'Invalid receipt even in Sandbox',
                    result: {
                        sandboxVerificationResult: sandboxVerificationResult
                    }
                });
                logger_1.default.error("Invalid receipt even in Sandbox");
            }
        }
        else {
            res.status(400).json({
                statusCode: -1,
                message: 'Invalid receipt',
                result: {
                    verificationResult: verificationResult
                }
            });
            logger_1.default.error("Invalid receipt");
        }
    }
    catch (error) {
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {}
        });
        logger_1.default.error(`Error purchase credit: ${error}`);
    }
});
exports.purchaseCredit = purchaseCredit;

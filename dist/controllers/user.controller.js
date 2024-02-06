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
exports.purchaseProduct = exports.purchaseCredit = exports.getAdreward = exports.getAdrewardAmount = exports.getCreditTransaction = exports.getLikelistByUid = exports.getWishlistByUid = exports.getProductsByUid = exports.getFollowing = exports.getFollower = exports.checkFollow = exports.follow = exports.findProducts = exports.getFaq = exports.faqUpload = exports.deleteUser = exports.fixProfile = exports.getProfileByUid = exports.login = void 0;
const admin = __importStar(require("firebase-admin"));
const user_model_1 = require("../models/user.model");
const faq_model_1 = require("../models/faq.model");
const follow_model_1 = require("../models/follow.model");
const guideline_model_1 = require("../models/guideline.model");
const filter_model_1 = require("../models/filter.model");
const wish_model_1 = require("../models/wish.model");
const like_model_1 = require("../models/like.model");
const credit_model_1 = require("../models/credit.model");
const mongoose_1 = __importDefault(require("mongoose"));
const adReward = 1;
const axios_1 = __importDefault(require("axios"));
const order_model_1 = require("../models/order.model");
const income_model_1 = require("../models/income.model");
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idToken } = req.body;
    try {
        const decodedToken = yield admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;
        console.log(decodedToken);
        console.log(uid);
        // 데이터베이스에서 uid 조회
        const userData = yield user_model_1.User.getFromUid(uid);
        if (userData) {
            // 이미 해당 uid를 가지는 사용자 정보가 있는 경우
            res.status(200).json(userData);
        }
        else {
            // 해당 uid를 가지는 사용자 정보가 없는 경우
            const newUser = yield user_model_1.User.createNewUser(decodedToken);
            res.status(200).json(newUser);
        }
    }
    catch (error) {
        console.error(error);
        res.status(401).json({ error: error });
    }
});
exports.login = login;
const getProfileByUid = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const uid = req.params.uid;
    try {
        // 데이터베이스에서 uid 조회
        const user = yield user_model_1.User.getFromUid(uid);
        if (user) {
            res.status(200).json({
                user: user
            });
        }
        else {
            res.status(201).json({
                message: "User not found"
            });
        }
    }
    catch (error) {
        console.error(error);
        res.status(401).json({
            error: error
        });
    }
});
exports.getProfileByUid = getProfileByUid;
const fixProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idToken, bio, displayName, instagramName, tiktokName, youtubeName, photoURL } = req.body;
    const newUserData = {
        bio: bio,
        displayName: displayName,
        instagramName: instagramName,
        tiktokName: tiktokName,
        youtubeName: youtubeName,
        photoURL: photoURL
    };
    try {
        const decodedToken = yield admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;
        // 데이터베이스에서 uid 조회
        yield user_model_1.User.findOneAndUpdate({ uid: uid }, { $set: newUserData });
        const result = yield user_model_1.User.getFromUid(uid);
        console.log(result);
        res.status(200).json({
            statusCode: 0,
            message: "Successfully updated!",
            result: result
        });
    }
    catch (error) {
        console.error(error);
        res.status(200).json({
            statusCode: -1,
            message: error,
            result: {}
        });
    }
});
exports.fixProfile = fixProfile;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idToken } = req.body;
    try {
        const decodedToken = yield admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;
        yield admin.auth().deleteUser(uid);
        yield user_model_1.User.deleteOne({ uid });
        res.status(200).json({
            statusCode: 0,
            message: "success",
            result: {}
        });
    }
    catch (error) {
        console.log("try failed due to:");
        console.error(error);
        res.status(200).json({
            statusCode: -1,
            message: error,
            result: {}
        });
    }
});
exports.deleteUser = deleteUser;
const faqUpload = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid, title, content, type } = req.body;
    if (!uid || !title || !content || !type) {
        res.status(200).json({
            statusCode: -1,
            message: "essential data not found.",
            result: {}
        });
    }
    const faqData = {
        uid, title, content, faqType: type, createdAt: Date.now()
    };
    const newFaq = new faq_model_1.Faq(faqData);
    yield newFaq.save();
    res.status(200).json({
        statusCode: 0,
        message: "faq uploaded successfully.",
        result: newFaq
    });
});
exports.faqUpload = faqUpload;
const getFaq = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const uid = req.params.uid;
    const result = yield faq_model_1.Faq.getFromUid(uid);
    res.status(200).json({
        statusCode: 0,
        message: "List read.",
        result
    });
});
exports.getFaq = getFaq;
const findProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const productInUse = req.body.productInUse;
    const idToken = req.body.idToken;
    try {
        const decodedToken = yield admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;
        const result = yield user_model_1.User.findOneAndUpdate({ uid: uid }, { $set: { productInUse: productInUse } });
        res.status(200).json({
            message: "Successfully updated!",
            result: result
        });
    }
    catch (error) {
        res.status(401).json({
            error: error
        });
    }
});
exports.findProducts = findProducts;
const follow = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { srcUid, dstUid } = req.body;
    try {
        const srcExist = yield user_model_1.User.exists({ uid: srcUid });
        const dstExist = yield user_model_1.User.exists({ uid: dstUid });
        if (!srcExist) {
            res.status(201).json({
                message: "Source user not found."
            });
            return;
        }
        if (!dstExist) {
            res.status(202).json({
                message: "Destination user not found."
            });
            return;
        }
        const result = yield follow_model_1.Follow.follow(srcUid, dstUid);
        res.status(200).json({
            message: result ? "Successfully followed" : "Successfully unfollowed",
            following: result,
            dstUid: dstUid
        });
    }
    catch (error) {
        res.status(401).json({
            error: error
        });
    }
});
exports.follow = follow;
const checkFollow = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const srcUid = req.query.src;
    const dstUid = req.query.dst;
    if (!srcUid || !dstUid) {
        console.error("src or dst not found");
        res.status(202).json({
            message: "query not found."
        });
        return;
    }
    try {
        const srcExist = yield user_model_1.User.exists({ uid: srcUid });
        const dstExist = yield user_model_1.User.exists({ uid: dstUid });
        if (!srcExist) {
            res.status(201).json({
                message: "Source user not found."
            });
            return;
        }
        if (!dstExist) {
            res.status(202).json({
                message: "Destination user not found."
            });
            return;
        }
        const result = yield follow_model_1.Follow.isFollowed(srcUid, dstUid);
        res.status(200).json({
            message: result ? "Successfully followed" : "Successfully unfollowed",
            following: result,
            dstUid: dstUid
        });
    }
    catch (error) {
        res.status(401).json({
            error: error
        });
    }
});
exports.checkFollow = checkFollow;
const getFollower = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uid = req.params.uid;
        const followerList = yield follow_model_1.Follow.getFollowerList(uid);
        res.json({
            statusCode: 0,
            message: "successfully get follower list",
            result: followerList
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            statusCode: -1,
            message: error
        });
    }
});
exports.getFollower = getFollower;
const getFollowing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uid = req.params.uid;
        const followingList = yield follow_model_1.Follow.getFollowingList(uid);
        res.json({
            statusCode: 0,
            message: "successfully get following list",
            result: followingList
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            statusCode: -1,
            message: error
        });
    }
});
exports.getFollowing = getFollowing;
const getProductsByUid = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const idToken = req.body.idToken;
    try {
        const decodedToken = yield admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;
        const filters = yield filter_model_1.Filter.getListFromCreatorUid(uid);
        const guidelines = yield guideline_model_1.Guideline.getListFromCreatorUid(uid);
        res.status(200).json({
            statusCode: 0,
            message: "successfully read products",
            result: {
                filters,
                guidelines
            }
        });
    }
    catch (error) {
        console.error(error);
        res.status(200).json({
            statusCode: -1,
            message: error,
            result: {
                filters: [],
                guidelines: []
            }
        });
    }
});
exports.getProductsByUid = getProductsByUid;
const getWishlistByUid = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const uid = req.params.uid;
    try {
        const wishlistData = yield wish_model_1.Wish.getWishlist(uid);
        res.status(200).json({
            statusCode: 0,
            message: 'Successfully read wishlist.',
            result: {
                filters: wishlistData.filters,
                guidelines: wishlistData.guidelines,
            }
        });
    }
    catch (error) {
        console.error('Error :', error);
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {
                filters: [],
                guidelines: []
            }
        });
    }
});
exports.getWishlistByUid = getWishlistByUid;
const getLikelistByUid = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const uid = req.params.uid;
    try {
        const likelistData = yield like_model_1.Like.getLikelist(uid);
        res.status(200).json({
            statusCode: 0,
            message: 'Successfully read likelist.',
            result: {
                filters: likelistData.filters,
                guidelines: likelistData.guidelines,
            }
        });
    }
    catch (error) {
        console.error('Error :', error);
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {
                filters: [],
                guidelines: []
            }
        });
    }
});
exports.getLikelistByUid = getLikelistByUid;
const getCreditTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const idToken = req.params.idToken;
    try {
        const decodedToken = yield admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;
        const credits = yield credit_model_1.Credit.find({ uid: uid });
        const transactions = yield credit_model_1.CreditTransaction.find({ creditId: { $in: credits.map(credit => credit._id) } });
        res.status(200).json({
            message: "Successfully updated!",
            transactions
        });
    }
    catch (error) {
        res.status(401).json({
            error: error
        });
    }
});
exports.getCreditTransaction = getCreditTransaction;
const getAdrewardAmount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).json({
        statusCode: 0,
        message: "Success",
        result: adReward
    });
});
exports.getAdrewardAmount = getAdrewardAmount;
const getAdreward = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const idToken = req.body.idToken;
    const session = yield mongoose_1.default.startSession();
    try {
        const decodedToken = yield admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;
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
});
exports.getAdreward = getAdreward;
const purchaseCredit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { uid, atid } = req.body;
        const receiptData = req.body.receiptData;
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
                    res.status(400).json({
                        error: "this transaction already created."
                    });
                    return;
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
                res.status(200).json({ message: 'Credit purchase verified and saved successfully', newCredit, newTransaction });
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
                res.status(400).json({
                    error: "this transaction already created."
                });
                return;
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
                    res.status(200).json({ message: 'Credit purchase verified and saved successfully', newCredit, newTransaction });
                }
                catch (error) {
                    yield session.abortTransaction();
                    throw error;
                }
                finally {
                    session.endSession();
                }
            }
            else {
                res.status(400).json({ error: 'Invalid receipt even in Sandbox', details: sandboxVerificationResult });
            }
        }
        else {
            console.log(verificationResult);
            res.status(400).json({ error: 'Invalid receipt', details: verificationResult });
        }
    }
    catch (error) {
        res.status(500).json({ error: 'An error occurred while verifying credit purchase', details: error });
    }
});
exports.purchaseCredit = purchaseCredit;
const purchaseProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const idToken = req.body.idToken;
    const productId = req.body.productId;
    const productType = req.body.productType;
    let uid = "";
    try {
        const decodedToken = yield admin.auth().verifyIdToken(idToken);
        uid = decodedToken.uid;
    }
    catch (error) {
        console.error("error while verify ifToken.");
        console.error(error);
        res.status(401).json({ error });
    }
    if (uid === "") {
        res.status(401).json({
            error: "Cannot verify idToken."
        });
    }
    // 이미 구매한 제품인지 확인하는 프로세스
    const existOrder = yield order_model_1.Order.findOne({ uid: uid, productId: productId, productType: productType });
    if (existOrder) {
        res.status(202).json({
            message: "User already purchased this product.",
            productId,
            productType,
            uid
        });
        return;
    }
    let product = {};
    try {
        if (productType === "Filter") {
            product = yield filter_model_1.Filter.getFromObjId(productId);
        }
        else if (productType === "Guideline") {
            product = yield guideline_model_1.Guideline.getFromObjId(productId);
        }
    }
    catch (error) {
        console.error("Error while load product data");
        console.error(`productType=${productType}, productId=${productId}`);
        console.error(error);
        res.status(402).json({
            productType,
            productId,
            error
        });
    }
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
        res.status(201).json({
            message: "Not enough credits to purchase this product.",
            credits_of: productPrice
        });
        return;
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
        console.error("purchase transaction failed.");
        console.error("Due to :");
        console.error(error);
        res.status(400).json({
            error
        });
    }
    finally {
        session.endSession();
    }
    const user = yield user_model_1.User.getFromUid(uid);
    res.status(200).json({
        message: "Successfully purchase product!",
        user,
        productId,
        productPrice: product.credit,
        productType,
        purchasedAt: currentTime,
        orderId: orderId
    });
});
exports.purchaseProduct = purchaseProduct;

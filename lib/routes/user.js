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
const axios_1 = __importDefault(require("axios"));
// router 객체
const router = express_1.default.Router();
const admin = __importStar(require("firebase-admin"));
const user_1 = require("../models/user");
const follow_1 = require("../models/follow");
const wish_1 = require("../models/wish");
const like_1 = require("../models/like");
const filter_1 = require("../models/filter");
const guideline_1 = require("../models/guideline");
const credit_1 = require("../models/credit");
const order_1 = require("../models/order");
const income_1 = require("../models/income");
const faq_1 = require("../models/faq");
router.post("/auth", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idToken } = req.body;
    try {
        const decodedToken = yield admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;
        // 데이터베이스에서 uid 조회
        const userData = yield user_1.User.getFromUid(uid);
        if (userData) {
            // 이미 해당 uid를 가지는 사용자 정보가 있는 경우
            res.status(200).json(userData);
        }
        else {
            // 해당 uid를 가지는 사용자 정보가 없는 경우
            const newUser = yield user_1.User.createNewUser(decodedToken);
            res.status(200).json(newUser);
        }
    }
    catch (error) {
        console.error(error);
        res.status(401).json({ error: error });
    }
}));
router.get("/profile/uid/:uid", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const uid = req.params.uid;
    try {
        // 데이터베이스에서 uid 조회
        const user = yield user_1.User.getFromUid(uid);
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
}));
router.post("/faq", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    const newFaq = new faq_1.Faq(faqData);
    yield newFaq.save();
    res.status(200).json({
        statusCode: 0,
        message: "faq uploaded successfully.",
        result: newFaq
    });
}));
router.get('/faq/list/:uid', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const uid = req.params.uid;
    const result = yield faq_1.Faq.getFromUid(uid);
    res.status(200).json({
        statusCode: 0,
        message: "List read.",
        result
    });
}));
// idToken을 받아서 user 정보 수정하기
router.post("/profile", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        yield user_1.User.findOneAndUpdate({ uid: uid }, { $set: newUserData });
        const result = yield user_1.User.getFromUid(uid);
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
}));
router.post("/products", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const productInUse = req.body.productInUse;
    const idToken = req.body.idToken;
    try {
        const decodedToken = yield admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;
        const result = yield user_1.User.findOneAndUpdate({ uid: uid }, { $set: { productInUse: productInUse } });
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
}));
router.post("/follow", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { srcUid, dstUid } = req.body;
    try {
        const srcExist = yield user_1.User.exists({ uid: srcUid });
        const dstExist = yield user_1.User.exists({ uid: dstUid });
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
        const result = yield follow_1.Follow.follow(srcUid, dstUid);
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
}));
router.get("/follow/check", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const srcExist = yield user_1.User.exists({ uid: srcUid });
        const dstExist = yield user_1.User.exists({ uid: dstUid });
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
        const result = yield follow_1.Follow.isFollowed(srcUid, dstUid);
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
}));
router.post("/manage/products", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const idToken = req.body.idToken;
    try {
        const decodedToken = yield admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;
        const filters = yield filter_1.Filter.getListFromCreatorUid(uid);
        const guidelines = yield guideline_1.Guideline.getListFromCreatorUid(uid);
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
}));
router.get("/wishlist/:uid", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const uid = req.params.uid;
    const wishlist = yield wish_1.Wish.find({ uid: uid });
    const filterIds = wishlist.filter(wish => wish.productType === "Filter")
        .map(wish => wish.productId);
    const guidelineIds = wishlist.filter(wish => wish.productType === "Guideline")
        .map(wish => wish.productId);
    const filters = yield filter_1.Filter.find({ _id: { $in: filterIds } })
        .populate('likedCount')
        .populate('wishedCount')
        .populate('usedCount')
        .populate('creator');
    const guidelines = yield guideline_1.Guideline.find({ _id: { $in: guidelineIds } })
        .populate('likedCount')
        .populate('wishedCount')
        .populate('usedCount')
        .populate('creator');
    res.status(200).json({
        filters: filters,
        guidelines: guidelines,
        message: "Successfully read wishlist."
    });
}));
router.get("/likelist/:uid", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const uid = req.params.uid;
    const likelist = yield like_1.Like.find({ uid: uid });
    const filterIds = likelist.filter(like => like.productType === "Filter")
        .map(like => like.productId);
    const guidelineIds = likelist.filter(like => like.productType === "Guideline")
        .map(like => like.productId);
    const filters = yield filter_1.Filter.find({ _id: { $in: filterIds } })
        .populate('likedCount')
        .populate('wishedCount')
        .populate('usedCount')
        .populate('creator');
    const guidelines = yield guideline_1.Guideline.find({ _id: { $in: guidelineIds } })
        .populate('likedCount')
        .populate('wishedCount')
        .populate('usedCount')
        .populate('creator');
    res.status(200).json({
        filters: filters,
        guidelines: guidelines,
        message: "Successfully read wishlist."
    });
}));
router.get("/transactions/:idToken", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const idToken = req.params.idToken;
    try {
        const decodedToken = yield admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;
        const credits = yield credit_1.Credit.find({ uid: uid });
        const transactions = yield credit_1.CreditTransaction.find({ creditId: { $in: credits.map(credit => credit._id) } });
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
}));
// 광고 시청으로 획득한 크레딧
router.post("/adreward", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const idToken = req.body.idToken;
    const session = yield mongoose_1.default.startSession();
    try {
        const decodedToken = yield admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;
        session.startTransaction();
        const currentTime = Date.now();
        const creditInfo = {
            uid: uid,
            amount: 3,
            createdAt: currentTime,
            expireAt: -1,
            creditType: "AD"
        };
        const newCredit = new credit_1.Credit(creditInfo);
        const newTransaction = new credit_1.CreditTransaction({
            creditId: newCredit._id,
            amount: 3,
            createdAt: currentTime,
            transactionType: "AD_REWARD"
        });
        yield newCredit.save({ session });
        yield newTransaction.save({ session });
        yield session.commitTransaction();
        const resultUser = yield user_1.User.getFromUid(uid);
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
}));
// 인앱 결제로 구매한 credit (광고 시청 등으로 얻은 credit x)
router.post('/credit/purchase', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
                const existOrder = yield credit_1.Credit.find({ uid: uid, atid: atid }).session(session);
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
                const newCredit = new credit_1.Credit(creditInfo);
                const newTransaction = new credit_1.CreditTransaction({
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
            const existOrder = yield credit_1.Credit.find({ uid: uid, atid: atid });
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
                    const newCredit = new credit_1.Credit(creditInfo);
                    const newTransaction = new credit_1.CreditTransaction({
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
}));
router.post("/purchase", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    const existOrder = yield order_1.Order.findOne({ uid: uid, productId: productId, productType: productType });
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
            product = yield filter_1.Filter.getFromObjId(productId);
        }
        else if (productType === "Guideline") {
            product = yield guideline_1.Guideline.getFromObjId(productId);
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
    let credits = yield credit_1.Credit.find({
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
            const transaction = new credit_1.CreditTransaction(data);
            yield transaction.save({ session });
        }
        const order = new order_1.Order({
            uid: uid,
            productId: productId,
            productType: productType,
            createdAt: currentTime,
            orderType: "CREDIT"
        });
        yield order.save({ session });
        orderId = `${order._id}`;
        const income = new income_1.Income({
            uid: product.creatorUid,
            orderId: orderId,
            createdAt: currentTime,
            isSettled: false,
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
    const user = yield user_1.User.getFromUid(uid);
    res.status(200).json({
        message: "Successfully purchase product!",
        user,
        productId,
        productPrice: product.credit,
        productType,
        purchasedAt: currentTime,
        orderId: orderId
    });
}));
exports.default = router;

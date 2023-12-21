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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSchema = exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const credit_1 = require("./credit");
const follow_1 = require("./follow");
const filter_1 = require("./filter");
const guideline_1 = require("./guideline");
const order_1 = require("./order");
follow_1.Follow;
const UserSchema = new mongoose_1.Schema({
    uid: {
        required: true,
        unique: true,
        type: String,
    },
    email: String,
    displayName: {
        required: true,
        type: String,
    },
    photoURL: {
        type: String
    },
    bio: {
        required: true,
        type: String
    },
    signupDate: {
        required: true,
        type: Number
    },
    instagramName: {
        type: String
    },
    tiktokName: {
        type: String
    },
    youtubeName: {
        type: String
    }
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
exports.UserSchema = UserSchema;
UserSchema.statics.search = function (keyword) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield User.find({
            $or: [
                { displayName: { $regex: new RegExp(keyword, 'i') } },
                { bio: { $regex: new RegExp(keyword, 'i') } }
            ],
        });
        return result;
    });
};
UserSchema.statics.getFromUid = function (uid) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var result = (_a = (yield User.findOne({ uid: uid }).populate('follower').populate('following'))) === null || _a === void 0 ? void 0 : _a.toObject();
            if (!result) {
                return null;
            }
            const credits = yield credit_1.Credit.find({
                uid: uid,
                $or: [
                    { expireAt: { $gt: Date.now() } },
                    { expireAt: -1 }
                ]
            });
            const creditAmount = credits.reduce((amount, credit) => amount + credit.amount, 0);
            result.credit = creditAmount;
            const guidelines = yield purchasedGuidelines(uid);
            const filters = yield purchasedFilters(uid);
            result.filters = filters;
            result.guidelines = guidelines;
            console.log(result);
            return result;
        }
        catch (error) {
            throw error;
        }
    });
};
UserSchema.statics.getFromObjId = function (_id) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = (_a = (yield User.findById(_id).populate('follower').populate('following'))) === null || _a === void 0 ? void 0 : _a.toObject();
            if (!result) {
                return null;
            }
            const credits = yield credit_1.Credit.find({
                uid: result.uid,
                $or: [
                    { expireAt: { $gt: Date.now() } },
                    { expireAt: -1 }
                ]
            });
            const creditAmount = credits.reduce((amount, credit) => amount + credit.amount, 0);
            result.credit = creditAmount;
            return result;
        }
        catch (error) {
            throw error;
        }
    });
};
UserSchema.statics.createNewUser = function (token) {
    return __awaiter(this, void 0, void 0, function* () {
        const bio = `안녕하세요 ${token.name}입니다.`;
        const signupDate = Date.now();
        const newUser = new this({
            uid: token.uid,
            email: token.email,
            displayName: token.name,
            photoURL: token.picture,
            bio: bio,
            signupDate: signupDate,
            productInUse: []
        });
        try {
            const result = yield newUser.save();
            return result;
        }
        catch (error) {
            throw error;
        }
    });
};
UserSchema.virtual('follower', {
    ref: "Follow",
    localField: 'uid',
    foreignField: 'dstUid',
    count: true
});
UserSchema.virtual("following", {
    ref: 'Follow',
    localField: 'uid',
    foreignField: 'srcUid',
    count: true
});
function purchasedFilters(uid) {
    return __awaiter(this, void 0, void 0, function* () {
        const orders = yield order_1.Order.find({ uid: uid });
        const filterIds = orders.filter(order => order.productType.toLowerCase() === "filter").map(order => order.productId);
        const filters = yield filter_1.Filter.find({ _id: { $in: filterIds } })
            .populate('likedCount')
            .populate('wishedCount')
            .populate('usedCount')
            .populate('creator');
        return filters;
    });
}
function purchasedGuidelines(uid) {
    return __awaiter(this, void 0, void 0, function* () {
        const orders = yield order_1.Order.find({ uid: uid });
        const guidelineIds = orders.filter(order => order.productType.toLowerCase() === "guideline").map(order => order.productId);
        const guidelines = yield guideline_1.Guideline.find({ _id: { $in: guidelineIds } })
            .populate('likedCount')
            .populate('wishedCount')
            .populate('usedCount')
            .populate('creator');
        return guidelines;
    });
}
const User = mongoose_1.default.model("User", UserSchema, "user");
exports.User = User;

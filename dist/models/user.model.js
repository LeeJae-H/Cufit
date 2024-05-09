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
const credit_model_1 = require("./credit.model");
const follow_model_1 = require("./follow.model");
const filter_model_1 = require("./filter.model");
const guideline_model_1 = require("./guideline.model");
const order_model_1 = require("./order.model");
follow_model_1.Follow;
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
        })
            .populate('follower').populate('following');
        return result;
    });
};
UserSchema.statics.getCredits = function (uid) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield credits(uid);
        }
        catch (error) {
            throw error;
        }
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
            const creditAmount = yield credits(result.uid);
            result.credit = creditAmount;
            const guidelines = yield purchasedGuidelines(uid);
            const filters = yield purchasedFilters(uid);
            result.filters = filters;
            result.guidelines = guidelines;
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
            const creditAmount = yield credits(result.uid);
            result.credit = creditAmount;
            return result;
        }
        catch (error) {
            throw error;
        }
    });
};
UserSchema.statics.createNewUser = function (token) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const displayName = (_a = token.name) !== null && _a !== void 0 ? _a : yield checkAndReturnUniqueNickname();
        const bio = `안녕하세요 ${displayName}입니다.`;
        const signupDate = Date.now();
        const newUser = new this({
            uid: token.uid,
            email: token.email,
            displayName: displayName,
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
UserSchema.statics.getPurchasedGuidelines = function (uid) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield purchasedGuidelines(uid);
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
function credits(uid) {
    return __awaiter(this, void 0, void 0, function* () {
        const credits = yield credit_model_1.Credit.find({
            uid: uid,
            $or: [
                { expireAt: { $gt: Date.now() } },
                { expireAt: -1 }
            ]
        });
        const creditAmount = credits.reduce((amount, credit) => amount + credit.amount, 0);
        return creditAmount;
    });
}
function purchasedFilters(uid) {
    return __awaiter(this, void 0, void 0, function* () {
        const orders = yield order_model_1.Order.find({ uid: uid });
        const filterIds = orders.filter(order => order.productType.toLowerCase() === "filter").map(order => order.productId);
        const filters = yield filter_model_1.Filter.find({ _id: { $in: filterIds } })
            .populate('likedCount')
            .populate('wishedCount')
            .populate('usedCount')
            .populate('creator')
            .populate('authStatus');
        return filters;
    });
}
function purchasedGuidelines(uid) {
    return __awaiter(this, void 0, void 0, function* () {
        const orders = yield order_model_1.Order.find({ uid: uid });
        const guidelineIds = orders.filter(order => order.productType.toLowerCase() === "guideline").map(order => order.productId);
        const guidelines = yield guideline_model_1.Guideline.find({ _id: { $in: guidelineIds } })
            .populate('likedCount')
            .populate('wishedCount')
            .populate('usedCount')
            .populate('creator')
            .populate('authStatus');
        return guidelines;
    });
}
function generateNickname() {
    const subjects = ["사랑을", "행복을", "아름다움을", "자유를", "기쁨을"];
    const adverbs = ["추구하는", "삼키는", "쫓는", "알리는", "만끽하는"];
    const nouns = ["고양이", "강아지", "아기새", "돌고래", "곰돌이"];
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    const adverb = adverbs[Math.floor(Math.random() * adverbs.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${subject}${adverb}${noun}`;
}
function checkAndReturnUniqueNickname() {
    return __awaiter(this, void 0, void 0, function* () {
        // let count = 1;
        // let existingUser = await User.findOne({ displayName: nickname });
        // while (existingUser) {
        //   nickname = `${nickname}#${count}`;
        //   existingUser = await User.findOne({ displayName: nickname });
        //   count++;
        // }
        try {
            let nickname = generateNickname();
            let usersWithNickname = yield User.find({ "displayName": { $regex: new RegExp(nickname, "i") } });
            const uniqueName = `${nickname}#${usersWithNickname.length}`; // 사랑을추구하는고양이#0, 사랑을추구하는고양이#1 , ... 
            return uniqueName;
        }
        catch (error) {
            throw new Error(`Error return nickname: ${error}`);
        }
    });
}
const User = mongoose_1.default.model("User", UserSchema, "user");
exports.User = User;

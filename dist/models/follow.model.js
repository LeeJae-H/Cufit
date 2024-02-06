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
exports.FollowSchema = exports.Follow = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const user_model_1 = require("./user.model");
const FollowSchema = new mongoose_1.Schema({
    srcUid: {
        required: true,
        type: String,
    },
    dstUid: {
        required: true,
        type: String,
    },
    createdAt: {
        required: true,
        type: Number
    }
});
exports.FollowSchema = FollowSchema;
FollowSchema.statics.follow = function (srcUid, dstUid) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const findResult = yield Follow.findOne({ srcUid: srcUid, dstUid: dstUid });
            if (findResult) {
                yield this.deleteOne({ _id: findResult._id });
                return false;
            }
            else {
                const newFollowData = new this({
                    srcUid: srcUid,
                    dstUid: dstUid,
                    createdAt: Date.now()
                });
                yield newFollowData.save();
                return true;
            }
        }
        catch (error) {
            throw error;
        }
    });
};
FollowSchema.statics.isFollowed = function (srcUid, dstUid) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const findResult = yield Follow.exists({ srcUid: srcUid, dstUid: dstUid });
            return findResult !== null;
        }
        catch (error) {
            throw error;
        }
    });
};
FollowSchema.statics.getFollowerList = function (dstUid) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const follower = yield Follow.find({ dstUid }).select('srcUid');
            const followerIds = follower.map(follower => follower.srcUid);
            const followerList = yield user_model_1.User.find({ uid: { $in: followerIds } });
            return followerList;
        }
        catch (error) {
            throw error;
        }
    });
};
FollowSchema.statics.getFollowingList = function (srcUid) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const following = yield Follow.find({ srcUid }).select('dstUid');
            const followingIds = following.map(following => following.dstUid);
            const followingList = yield user_model_1.User.find({ uid: { $in: followingIds } });
            return followingList;
        }
        catch (error) {
            throw error;
        }
    });
};
const Follow = mongoose_1.default.model('Follow', FollowSchema, 'follow');
exports.Follow = Follow;

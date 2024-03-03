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
exports.LikeSchema = exports.Like = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const filter_model_1 = require("./filter.model");
const guideline_model_1 = require("./guideline.model");
const LikeSchema = new mongoose_1.Schema({
    uid: {
        required: true,
        type: String,
    },
    productId: {
        required: true,
        type: mongoose_1.default.Schema.Types.ObjectId,
        refPath: 'productType'
    },
    createdAt: {
        required: true,
        type: Number
    },
    productType: {
        required: true,
        type: String,
        enum: ['Filter', 'Guideline', 'PhotoZone']
    }
});
exports.LikeSchema = LikeSchema;
LikeSchema.statics.isExist = function (pid, uid, type) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield Like.findOne({
            productId: new mongoose_1.default.Types.ObjectId(pid),
            uid: uid,
            productType: type
        });
        if (result) {
            return true;
        }
        else {
            return false;
        }
    });
};
LikeSchema.statics.getLikelist = function (uid) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const likelist = yield Like.find({ uid: uid });
            const filterIds = likelist
                .filter((like) => like.productType === "Filter")
                .map((like) => like.productId);
            const guidelineIds = likelist
                .filter((like) => like.productType === "Guideline")
                .map((like) => like.productId);
            const filters = yield filter_model_1.Filter.find({ _id: { $in: filterIds } })
                .populate('likedCount')
                .populate('wishedCount')
                .populate('usedCount')
                .populate('authStatus')
                .populate('creator');
            const guidelines = yield guideline_model_1.Guideline.find({ _id: { $in: guidelineIds } })
                .populate('likedCount')
                .populate('wishedCount')
                .populate('usedCount')
                .populate('authStatus')
                .populate('creator');
            return { filters, guidelines };
        }
        catch (error) {
            console.error('Error in getLikelistByUid:', error);
            throw error;
        }
    });
};
const Like = mongoose_1.default.model('Like', LikeSchema, 'like');
exports.Like = Like;

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
exports.GuidelineSchema = exports.Guideline = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const like_1 = require("./like");
const order = __importStar(require("./order"));
const wish = __importStar(require("./wish"));
const user = __importStar(require("./user"));
const auth = __importStar(require("./auth"));
auth;
user;
order;
wish;
const GuidelineSchema = new mongoose_1.Schema({
    title: { required: true, type: String },
    tags: { required: true, type: [String] },
    description: { required: true, type: String },
    shortDescription: { required: true, type: String },
    createdAt: { required: true, type: Number },
    originalImageUrl: { required: true, type: String },
    guidelineImageUrl: { required: true, type: String },
    credit: { required: true, type: Number },
    type: { required: true, type: String, default: "Guideline" },
    placeName: { type: String },
    creatorUid: { required: true, type: String, ref: 'User' },
    location: { type: { type: String, enum: ['Point'], default: 'Point' }, coordinates: { type: [{ type: Number }], default: [0, 0] } }
}, {
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
});
exports.GuidelineSchema = GuidelineSchema;
GuidelineSchema.statics.getListFromCreatorUid = function (uid) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield Guideline.find({ creatorUid: uid }).sort({ _id: -1 }).limit(50)
                .populate('likedCount')
                .populate('wishedCount')
                .populate('usedCount')
                .populate('authStatus')
                .populate('creator');
            return result;
        }
        catch (error) {
            throw error;
        }
    });
};
GuidelineSchema.statics.getListFromTag = function (tag) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield Guideline.find({ tags: { $elemMatch: { $regex: tag, $options: 'i' } } }).sort({ _id: -1 }).limit(50)
                .populate('likedCount')
                .populate('wishedCount')
                .populate('usedCount')
                .populate('authStatus')
                .populate('creator');
            return result;
        }
        catch (error) {
            throw error;
        }
    });
};
GuidelineSchema.statics.getFromObjId = function (_id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield Guideline.findById(_id)
                .populate('likedCount')
                .populate('wishedCount')
                .populate('usedCount')
                .populate('authStatus')
                .populate('creator');
            return result;
        }
        catch (error) {
            throw error;
        }
    });
};
GuidelineSchema.statics.getListFromTagWithSort = function (tag, sortBy, sort) {
    return __awaiter(this, void 0, void 0, function* () {
        let query = Guideline.find({ tags: { $elemMatch: { $regex: tag, $options: 'i' } } });
        if (sortBy === "l") {
            if (sort === "a") {
                return yield query.sort({ _id: -1 }).limit(20)
                    .populate('likedCount')
                    .populate('wishedCount')
                    .populate('usedCount')
                    .populate('authStatus')
                    .populate('creator');
            }
            else {
                return yield query.sort({ _id: 1 }).limit(20)
                    .populate('likedCount')
                    .populate('wishedCount')
                    .populate('usedCount')
                    .populate('authStatus')
                    .populate('creator');
            }
        }
        else if (sortBy === "p") {
            if (sort === "a") {
                return yield query.sort({ likedCount: -1 }).limit(20)
                    .populate('likedCount')
                    .populate('wishedCount')
                    .populate('usedCount')
                    .populate('authStatus')
                    .populate('creator');
            }
            else {
                return yield query.sort({ likedCount: 1 }).limit(20)
                    .populate('likedCount')
                    .populate('wishedCount')
                    .populate('usedCount')
                    .populate('authStatus')
                    .populate('creator');
            }
        }
        else {
            return [];
        }
    });
};
GuidelineSchema.statics.top5 = function () {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const top5Guidelines = yield like_1.Like.aggregate([
                {
                    $match: { productType: 'Guideline' }
                },
                {
                    $group: {
                        _id: '$productId',
                        likeCount: { $sum: 1 }
                    }
                },
                {
                    $lookup: {
                        from: 'guideline', // 'guidelines'는 실제 Guideline 컬렉션의 이름입니다.
                        localField: '_id',
                        foreignField: '_id',
                        as: 'guideline'
                    }
                },
                {
                    $unwind: { path: '$guideline', preserveNullAndEmptyArrays: true }
                },
                {
                    $sort: { likeCount: -1 }
                },
                {
                    $limit: 5
                },
                {
                    $project: {
                        _id: '$guideline._id'
                    }
                }
            ]);
            const guidelineIds = top5Guidelines.map((item) => item._id);
            // Guideline 모델에서 상위 5개 Guideline을 가져오기
            let top5GuidelineDocuments = yield Guideline.find({ _id: { $in: guidelineIds } })
                .populate('likedCount')
                .populate('wishedCount')
                .populate('usedCount')
                .populate('authStatus')
                .populate('creator');
            if (top5GuidelineDocuments.length < 5) {
                const additional = yield Guideline.find().sort({ _id: -1 })
                    .limit(5 - top5GuidelineDocuments.length)
                    .populate('likedCount')
                    .populate('wishedCount')
                    .populate('usedCount')
                    .populate('authStatus')
                    .populate('creator');
                additional.forEach(item => {
                    top5GuidelineDocuments.push(item);
                });
            }
            return top5GuidelineDocuments;
        }
        catch (error) {
            console.error('Error getting top 5 guidelines by likes:', error);
            throw error;
        }
    });
};
GuidelineSchema.statics.newSearch = function (keyword) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield Guideline.aggregate([
            {
                $match: {
                    // authStatus: {
                    //   $match: {
                    //     code: "authorized"
                    //   }
                    // },
                    $or: [
                        { tags: { $elemMatch: { $regex: keyword, $options: 'i' } } },
                        { title: { $regex: new RegExp(keyword, 'i') } },
                        { description: { $regex: new RegExp(keyword, 'i') } },
                        { shortDescription: { $regex: new RegExp(keyword, 'i') } },
                    ],
                }
            }
        ]);
        // let result = await Guideline.find({
        //   $or: [
        //     { tags: { $elemMatch: { $regex: keyword, $options: 'i' } } },
        //     { title: { $regex: new RegExp(keyword, 'i') } },
        //     { description: { $regex: new RegExp(keyword, 'i') } },
        //     { shortDescription: { $regex: new RegExp(keyword, 'i') } },
        //   ],
        // })
        return result;
    });
};
GuidelineSchema.statics.search = function (keyword, sort, sortby, cost) {
    return __awaiter(this, void 0, void 0, function* () {
        if (sortby === "p") { // like순서
            let result = searchByLike(keyword, sort === "d", cost === "f");
            return result;
        }
        else { // 최신순
            let result = yield Guideline.find({
                $or: [
                    { tags: { $elemMatch: { $regex: keyword, $options: 'i' } } },
                    { title: { $regex: new RegExp(keyword, 'i') } },
                    { description: { $regex: new RegExp(keyword, 'i') } },
                    { shortDescription: { $regex: new RegExp(keyword, 'i') } },
                ],
                credit: cost === "f" ?
                    { $eq: 0 } :
                    { $gt: 0 }
            })
                .sort({ _id: sort === "d" ? -1 : 1 })
                .populate('likedCount')
                .populate('wishedCount')
                .populate('usedCount')
                .populate('authStatus')
                .populate('creator');
            return result;
        }
    });
};
GuidelineSchema.virtual('likedCount', {
    ref: 'Like',
    localField: '_id',
    foreignField: 'productId',
    count: true
});
GuidelineSchema.virtual('wishedCount', {
    ref: 'Wish',
    localField: '_id',
    foreignField: 'productId',
    count: true
});
GuidelineSchema.virtual('usedCount', {
    ref: 'Order',
    localField: '_id',
    foreignField: 'productId',
    count: true
});
GuidelineSchema.virtual('creator', {
    ref: 'User',
    localField: 'creatorUid',
    foreignField: 'uid',
    justOne: true
});
GuidelineSchema.virtual('authStatus', {
    ref: 'Auth',
    localField: '_id',
    foreignField: 'productId',
    justOne: true
});
GuidelineSchema.index({ location: "2dsphere" });
function searchByLike(keyword, desc, isFree) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield like_1.Like.aggregate([
            {
                $match: {
                    productType: "Guideline"
                },
            },
            {
                $group: {
                    _id: '$productId',
                    likedCount: { $sum: 1 },
                }
            },
            {
                $lookup: {
                    from: "filter",
                    localField: "_id",
                    foreignField: "_id",
                    as: "filterData",
                }
            },
            {
                $unwind: {
                    path: '$filterData',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    _id: '$filterData._id',
                    tags: '$filterData.tags',
                    title: '$filterData.title',
                    description: '$filterData.description',
                    shortDescription: '$filterData.shortDescription',
                    credit: '$filterData.credit'
                }
            },
            {
                $match: {
                    $or: [
                        { tags: { $elemMatch: { $regex: keyword, $options: 'i' } } },
                        { title: { $regex: new RegExp(keyword, 'i') } },
                        { description: { $regex: new RegExp(keyword, 'i') } },
                        { shortDescription: { $regex: new RegExp(keyword, 'i') } },
                    ],
                    credit: isFree ?
                        { $eq: 0 } :
                        { $gt: 0 }
                }
            },
            {
                $sort: { likedCount: desc ? -1 : 1 }
            }
        ]);
        const guidelineIds = result.map(item => item._id);
        const guidelines = yield Guideline.find({ _id: { $in: guidelineIds } })
            .populate('likedCount')
            .populate('wishedCount')
            .populate('usedCount')
            .populate('creator');
        return guidelines;
    });
}
const Guideline = mongoose_1.default.model("Guideline", GuidelineSchema, "guideline");
exports.Guideline = Guideline;

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
        if (sortBy === "l") {
            return yield getByLatest(tag, sort);
        }
        else if (sortBy === "p") {
            return yield getByLikedCount(tag, sort);
        }
        else {
            return [];
        }
    });
};
GuidelineSchema.statics.top5 = function () {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const filtered = yield Guideline.aggregate([
                {
                    $lookup: {
                        from: "auth",
                        localField: "_id",
                        foreignField: "productId",
                        as: "authStatus"
                    }
                },
                {
                    $unwind: "$authStatus"
                },
                {
                    $lookup: {
                        from: "like",
                        localField: "_id",
                        foreignField: "productId",
                        as: "likes"
                    }
                },
                {
                    $match: {
                        'authStatus.code': "authorized"
                    }
                },
                {
                    $project: {
                        likedCount: { $size: "$likes" }
                    }
                },
                {
                    $sort: {
                        likedCount: -1
                    }
                },
                {
                    $limit: 5
                }
            ]);
            const filteredIds = filtered.map(item => item._id).reverse();
            const top5Guidelines = yield Guideline.find({ _id: filteredIds })
                .populate('likedCount')
                .populate('wishedCount')
                .populate('usedCount')
                .populate('authStatus')
                .populate('creator');
            console.log('result');
            console.log(top5Guidelines);
            top5Guidelines.sort((a, b) => {
                return b.likedCount - a.likedCount;
            });
            return top5Guidelines;
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
                $lookup: {
                    from: "user",
                    localField: "creatorUid",
                    foreignField: "uid",
                    as: "creator"
                }
            },
            {
                $unwind: "$creator"
            },
            {
                $lookup: {
                    from: "auth",
                    localField: "_id",
                    foreignField: "productId",
                    as: "authStatus"
                }
            },
            {
                $unwind: "$authStatus"
            },
            {
                $match: {
                    "authStatus.code": "authorized",
                    $or: [
                        { tags: { $elemMatch: { $regex: keyword, $options: 'i' } } },
                        { title: { $regex: new RegExp(keyword, 'i') } },
                        { description: { $regex: new RegExp(keyword, 'i') } },
                        { shortDescription: { $regex: new RegExp(keyword, 'i') } },
                    ],
                }
            }
        ]);
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
            .populate('creator')
            .populate('authStatus');
        return guidelines;
    });
}
function getByLikedCount(tag, sort) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const filtered = yield Guideline.aggregate([
                {
                    $lookup: {
                        from: "auth",
                        localField: "_id",
                        foreignField: "productId",
                        as: "authStatus"
                    }
                },
                {
                    $unwind: "$authStatus"
                },
                {
                    $lookup: {
                        from: "like",
                        localField: "_id",
                        foreignField: "productId",
                        as: "likes"
                    }
                },
                {
                    $match: {
                        'authStatus.code': "authorized",
                        tags: { $elemMatch: { $regex: tag, $options: 'i' } }
                    }
                },
                {
                    $project: {
                        likedCount: { $size: "$likes" }
                    }
                },
                {
                    $sort: {
                        likedCount: sort === "a" ? 1 : -1
                    }
                },
                {
                    $limit: 20
                }
            ]);
            const filteredIds = filtered.map(item => item._id).reverse();
            const result = yield Guideline.find({ _id: filteredIds })
                .populate('likedCount')
                .populate('wishedCount')
                .populate('usedCount')
                .populate('authStatus')
                .populate('creator');
            console.log('result');
            console.log(result);
            return result;
        }
        catch (error) {
            console.error('Error getting top 5 guidelines by likes:', error);
            throw error;
        }
    });
}
function getByLatest(tag, sort) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const filtered = yield Guideline.aggregate([
                {
                    $lookup: {
                        from: "auth",
                        localField: "_id",
                        foreignField: "productId",
                        as: "authStatus"
                    }
                },
                {
                    $unwind: "$authStatus"
                },
                {
                    $match: {
                        'authStatus.code': "authorized",
                        tags: { $elemMatch: { $regex: tag, $options: 'i' } }
                    }
                },
                {
                    $sort: {
                        _id: sort === "a" ? 1 : -1
                    }
                },
                {
                    $limit: 20
                }
            ]);
            const filteredIds = filtered.map(item => item._id).reverse();
            const result = yield Guideline.find({ _id: filteredIds })
                .populate('likedCount')
                .populate('wishedCount')
                .populate('usedCount')
                .populate('authStatus')
                .populate('creator');
            console.log('result');
            console.log(result);
            return result;
        }
        catch (error) {
            console.error('Error getting top 5 guidelines by likes:', error);
            throw error;
        }
    });
}
const Guideline = mongoose_1.default.model("Guideline", GuidelineSchema, "guideline");
exports.Guideline = Guideline;

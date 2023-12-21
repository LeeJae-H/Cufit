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
exports.FilterSchema = exports.Filter = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const like_1 = require("./like");
const order = __importStar(require("./order"));
const wish = __importStar(require("./wish"));
const user = __importStar(require("./user"));
user;
order;
wish;
const FilterSchema = new mongoose_1.Schema({
    title: { required: true, type: String },
    tags: { required: true, type: [String] },
    description: { required: true, type: String },
    shortDescription: { required: true, type: String },
    createdAt: { required: true, type: Number },
    authStatus: { required: true, type: String },
    originalImageUrl: { required: true, type: String },
    filteredImageUrl: { required: true, type: String },
    credit: { required: true, type: Number },
    type: { required: true, type: String, default: "Filter" },
    creatorUid: { required: true, type: String, ref: 'User' },
    adjustment: { required: true, type: Object },
}, {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    }
});
exports.FilterSchema = FilterSchema;
FilterSchema.statics.getListFromCreatorUid = function (uid, auth) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (auth === "all") {
                const result = yield Filter.find({ creatorUid: uid }).sort({ _id: -1 }).limit(50)
                    .populate('likedCount')
                    .populate('wishedCount')
                    .populate('usedCount')
                    .populate('creator');
                return result;
            }
            else {
                const result = yield Filter.find({ creatorUid: uid, authStatus: auth }).sort({ _id: -1 }).limit(50)
                    .populate('likedCount')
                    .populate('wishedCount')
                    .populate('usedCount')
                    .populate('creator');
                return result;
            }
        }
        catch (error) {
            throw error;
        }
    });
};
FilterSchema.statics.getListFromCreatorId = function (cid, auth) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield Filter.find({ creatorId: cid, authStatus: auth }).sort({ _id: -1 }).limit(50)
                .populate('likedCount')
                .populate('wishedCount')
                .populate('usedCount')
                .populate('creator');
            return result;
        }
        catch (error) {
            throw error;
        }
    });
};
FilterSchema.statics.getListFromTag = function (tag, auth) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield Filter.find({ tags: { $elemMatch: { $regex: tag, $options: 'i' } }, authStatus: auth }).sort({ _id: -1 }).limit(50)
                .populate('likedCount')
                .populate('wishedCount')
                .populate('usedCount')
                .populate('creator');
            return result;
        }
        catch (error) {
            throw error;
        }
    });
};
FilterSchema.statics.getListFromTagWithSort = function (tag, sortBy, sort, auth) {
    return __awaiter(this, void 0, void 0, function* () {
        let query = Filter.find({ tags: { $elemMatch: { $regex: tag, $options: 'i' } }, authStatus: auth });
        if (sortBy === "l") {
            if (sort === "a") {
                return yield query.sort({ _id: -1 }).limit(20)
                    .populate('likedCount')
                    .populate('wishedCount')
                    .populate('usedCount')
                    .populate('creator');
            }
            else {
                return yield query.sort({ _id: 1 }).limit(20)
                    .populate('likedCount')
                    .populate('wishedCount')
                    .populate('usedCount')
                    .populate('creator');
            }
        }
        else if (sortBy === "p") {
            if (sort === "a") {
                return yield query.sort({ likedCount: -1 }).limit(20)
                    .populate('likedCount')
                    .populate('wishedCount')
                    .populate('usedCount')
                    .populate('creator');
            }
            else {
                return yield query.sort({ likedCount: 1 }).limit(20)
                    .populate('likedCount')
                    .populate('wishedCount')
                    .populate('usedCount')
                    .populate('creator');
            }
        }
        else {
            return [];
        }
    });
};
FilterSchema.statics.getFromObjId = function (_id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield Filter.findById(_id)
                .populate('likedCount')
                .populate('wishedCount')
                .populate('usedCount')
                .populate('creator');
            return result;
        }
        catch (error) {
            throw error;
        }
    });
};
FilterSchema.statics.search = function (keyword, sort, sortby, cost) {
    return __awaiter(this, void 0, void 0, function* () {
        if (sortby === "p") { // like순서
            let result = searchByLike(keyword, sort === "d", cost === "f");
            return result;
        }
        else { // 최신순
            let result = yield Filter.find({
                $or: [
                    { tags: { $elemMatch: { $regex: keyword, $options: 'i' } } },
                    { title: { $regex: new RegExp(keyword, 'i') } },
                    { description: { $regex: new RegExp(keyword, 'i') } },
                    { shortDescription: { $regex: new RegExp(keyword, 'i') } },
                ],
                credit: cost === "f" ?
                    { $eq: 0 } :
                    { $gt: 0 },
                authStatus: "authorized"
            })
                .sort({ _id: sort === "d" ? -1 : 1 })
                .populate('likedCount')
                .populate('wishedCount')
                .populate('usedCount')
                .populate('creator');
            return result;
        }
    });
};
FilterSchema.statics.top5 = function () {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const top5Filters = yield like_1.Like.aggregate([
                {
                    $match: { productType: 'Filter' }
                },
                {
                    $group: {
                        _id: '$productId',
                        likeCount: { $sum: 1 }
                    }
                },
                {
                    $lookup: {
                        from: 'filter', // 'guidelines'는 실제 Guideline 컬렉션의 이름입니다.
                        localField: '_id',
                        foreignField: '_id',
                        as: 'filter'
                    }
                },
                {
                    $unwind: { path: '$filter', preserveNullAndEmptyArrays: true }
                },
                {
                    $sort: { likeCount: -1 }
                },
                {
                    $limit: 5
                },
                {
                    $project: {
                        _id: '$filter._id'
                    }
                }
            ]);
            const filterIds = top5Filters.map((item) => item._id);
            const top5FilterDocuments = yield Filter.find({ _id: { $in: filterIds } })
                .populate('likedCount')
                .populate('wishedCount')
                .populate('usedCount')
                .populate('creator');
            if (top5FilterDocuments.length < 5) {
                const additional = yield Filter.find().sort({ _id: -1 })
                    .limit(5 - top5FilterDocuments.length)
                    .populate('likedCount')
                    .populate('wishedCount')
                    .populate('usedCount')
                    .populate('creator');
                additional.forEach(item => {
                    top5FilterDocuments.push(item);
                });
            }
            return top5FilterDocuments;
        }
        catch (error) {
            console.error('Error getting top 5 guidelines by likes:', error);
            throw error;
        }
    });
};
FilterSchema.virtual('likedCount', {
    ref: 'Like',
    localField: '_id',
    foreignField: 'productId',
    count: true
});
FilterSchema.virtual('wishedCount', {
    ref: 'Wish',
    localField: '_id',
    foreignField: 'productId',
    count: true
});
FilterSchema.virtual('usedCount', {
    ref: 'Order',
    localField: '_id',
    foreignField: 'productId',
    count: true
});
FilterSchema.virtual('creator', {
    ref: 'User',
    localField: 'creatorUid',
    foreignField: 'uid',
    justOne: true
});
function searchByLike(keyword, desc, isFree) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield like_1.Like.aggregate([
            {
                $match: {
                    productType: "Filter"
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
                    credit: '$filterData.credit',
                    authStatus: '$filterData.authStatus'
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
                        { $gt: 0 },
                    authStatus: "authorized"
                }
            },
            {
                $sort: { likedCount: desc ? -1 : 1 }
            }
        ]);
        const filterIds = result.map(item => item._id);
        const filters = yield Filter.find({ _id: { $in: filterIds } })
            .populate('likedCount')
            .populate('wishedCount')
            .populate('usedCount')
            .populate('creator');
        return filters;
    });
}
const Filter = mongoose_1.default.model("Filter", FilterSchema, "filter");
exports.Filter = Filter;

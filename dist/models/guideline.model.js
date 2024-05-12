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
const order = __importStar(require("./order.model"));
const wish = __importStar(require("./wish.model"));
const user = __importStar(require("./user.model"));
const auth = __importStar(require("./auth.model"));
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
/**
 * idToken -> verify middle
 * req -> uid?, code -> default -> authorized, all, code(selected)
 * response로 나가야하는 guideline -> creator, authStatus, likedCount, usedCount
 *
 */
GuidelineSchema.statics.getListFromCreatorUid = function (uid, code) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let pipeline = createInitialPipeline(code);
            pipeline.splice(4, 0, {
                $match: {
                    $or: [
                        { creatorUid: uid }
                    ]
                }
            });
            pipeline.push({
                $sort: { _id: -1 }
            }, {
                $limit: 50
            });
            let result = yield Guideline.aggregate(pipeline);
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
                .populate('creator')
                .populate('viewCount');
            return result;
        }
        catch (error) {
            throw error;
        }
    });
};
GuidelineSchema.statics.getPopular = function () {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let pipeline = createInitialPipeline();
            pipeline.concat([
                {
                    $sort: {
                        likedCount: -1
                    }
                },
                {
                    $limit: 20
                }
            ]);
            return yield Guideline.aggregate(pipeline);
        }
        catch (error) {
            throw error;
        }
    });
};
GuidelineSchema.statics.getFromObjId = function (_id, code) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let pipeline = createInitialPipeline(code);
            pipeline.unshift({
                $match: {
                    $or: [
                        { _id: new mongoose_1.default.Types.ObjectId(_id) }
                    ]
                }
            });
            let result = yield Guideline.aggregate(pipeline);
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
GuidelineSchema.statics.top5 = function (code) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let pipeline = createInitialPipeline(code);
            pipeline.push({
                $sort: {
                    likedCount: -1
                }
            }, {
                $limit: 5
            });
            let result = yield Guideline.aggregate(pipeline);
            return result;
        }
        catch (error) {
            console.error('Error getting top 5 guidelines by likes:', error);
            throw error;
        }
    });
};
GuidelineSchema.statics.newSearch = function (keyword, code) {
    return __awaiter(this, void 0, void 0, function* () {
        let pipeline = createInitialPipeline(code);
        pipeline.unshift({
            $match: {
                $or: [
                    { tags: { $elemMatch: { $regex: keyword, $options: 'i' } } },
                    { title: { $regex: new RegExp(keyword, 'i') } },
                    { description: { $regex: new RegExp(keyword, 'i') } },
                    { shortDescription: { $regex: new RegExp(keyword, 'i') } }
                ]
            }
        });
        let result = yield Guideline.aggregate(pipeline);
        return result;
    });
};
GuidelineSchema.statics.searchbyTitleOrTag = function (keyword, code) {
    return __awaiter(this, void 0, void 0, function* () {
        let pipeline = createInitialPipeline(code);
        pipeline.unshift({
            $match: {
                $or: [
                    { tags: { $elemMatch: { $regex: keyword, $options: 'i' } } },
                    { title: { $regex: new RegExp(keyword, 'i') } }
                ]
            }
        });
        let result = yield Guideline.aggregate(pipeline);
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
            let result = searchByLatest(keyword, sort === "d", cost === "f");
            return result;
        }
    });
};
GuidelineSchema.statics.findByDistance = function (lat, lng, distance, code) {
    return __awaiter(this, void 0, void 0, function* () {
        let pipeline = createInitialPipeline(code);
        pipeline.unshift({
            $geoNear: {
                near: {
                    type: "Point",
                    coordinates: [lng, lat]
                },
                distanceField: "distance",
                maxDistance: distance,
                spherical: true
            }
        });
        let result = yield Guideline.aggregate(pipeline);
        return result;
    });
};
GuidelineSchema.statics.findByArea = function (coordinates, code) {
    return __awaiter(this, void 0, void 0, function* () {
        let pipeline = createInitialPipeline(code);
        pipeline.unshift({
            $match: {
                location: {
                    $geoWithin: {
                        $geometry: {
                            type: "Polygon",
                            coordinates: [coordinates]
                        }
                    }
                }
            }
        });
        let result = yield Guideline.aggregate(pipeline);
        return result;
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
GuidelineSchema.virtual('viewCount', {
    ref: 'ViewCount',
    localField: '_id',
    foreignField: 'productId',
    count: true
});
GuidelineSchema.index({ location: "2dsphere" });
function searchByLatest(keyword, desc, isFree) {
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
                    $sort: {
                        _id: desc ? -1 : 1
                    }
                },
                {
                    $limit: 100
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
function searchByLike(keyword, desc, isFree) {
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
                    $project: {
                        likedCount: { $size: "$likes" }
                    }
                },
                {
                    $sort: {
                        likedCount: desc ? -1 : 1
                    }
                },
                {
                    $limit: 100
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
GuidelineSchema.statics.findAll = function (page, code) {
    return __awaiter(this, void 0, void 0, function* () {
        let pipeline = createInitialPipeline(code);
        pipeline = pagination(pipeline, page);
        let result = yield Guideline.aggregate(pipeline);
        return result;
    });
};
function pagination(pipeline, page) {
    let pagination = [
        {
            $skip: (page - 1) * 20
        },
        {
            $limit: 20
        }
    ];
    // pagination 변수가 배열이므로, push말고 concat을 해야함. push하면 배열 안에 배열 형태.
    const newPipeline = pipeline.concat(pagination);
    return newPipeline;
}
function createInitialPipeline(code) {
    let pipeline = [
        {
            $lookup: {
                from: "auth",
                let: { productId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$productId", "$$productId"] }
                        }
                    }
                ],
                as: "authStatus"
            }
        },
        {
            $unwind: "$authStatus"
        },
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
                from: "like",
                localField: "_id",
                foreignField: "productId",
                as: "likes"
            }
        },
        {
            $addFields: {
                likedCount: { $size: "$likes" }
            }
        },
        {
            $lookup: {
                from: "order",
                localField: "_id",
                foreignField: "productId",
                as: "orders"
            }
        },
        {
            $addFields: {
                usedCount: { $size: "$orders" }
            }
        },
        {
            $lookup: {
                from: "viewCount",
                localField: "_id",
                foreignField: "productId",
                as: "views"
            }
        },
        {
            $addFields: {
                viewCount: { $size: "$views" }
            }
        },
        {
            $project: {
                views: 0,
                orders: 0, // likes 필드를 제외하고 출력
                likes: 0
            }
        }
    ];
    if (code) {
        if (code !== "all") {
            pipeline.splice(2, 0, {
                $match: {
                    "authStatus.code": code
                }
            });
        }
    }
    else {
        pipeline.splice(2, 0, {
            $match: {
                "authStatus.code": "authorized"
            }
        });
    }
    return pipeline;
}
const Guideline = mongoose_1.default.model("Guideline", GuidelineSchema, "guideline");
exports.Guideline = Guideline;

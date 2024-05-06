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
exports.PhotoZoneSchema = exports.PhotoZone = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const PhotoZoneSchema = new mongoose_1.Schema({
    uid: {
        required: true,
        type: String,
    },
    placeName: {
        required: true,
        type: String,
    },
    description: {
        required: true,
        type: String,
    },
    title: {
        required: true,
        type: String,
    },
    shortDescription: {
        required: true,
        type: String,
    },
    imageUrls: {
        required: true,
        type: [{ type: String }],
    },
    createdAt: {
        required: true,
        type: Number,
    },
    tags: {
        required: true,
        type: [String]
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [{ type: Number }],
            default: [0, 0]
        }
    }
}, {
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
});
exports.PhotoZoneSchema = PhotoZoneSchema;
PhotoZoneSchema.index({ location: "2dsphere" });
PhotoZoneSchema.statics.getFromObjId = function (_id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let pipeline = createInitialPipeline();
            pipeline.unshift({
                $match: {
                    $or: [
                        { _id: new mongoose_1.default.Types.ObjectId(_id) }
                    ]
                }
            });
            let result = yield PhotoZone.aggregate(pipeline);
            return result;
        }
        catch (error) {
            throw error;
        }
    });
};
PhotoZoneSchema.statics.findByDistance = function (lat, lng, distance) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = PhotoZone.find({
            location: {
                $near: {
                    $maxDistance: distance,
                    $geometry: {
                        type: 'Point',
                        coordinates: [lng, lat],
                    },
                },
            },
        })
            .populate("likedCount")
            .populate("viewCount")
            .populate("creator");
        return result;
    });
};
PhotoZoneSchema.statics.findByArea = function (coordinates, code) {
    return __awaiter(this, void 0, void 0, function* () {
        let pipeline = createInitialPipeline();
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
        let result = yield PhotoZone.aggregate(pipeline);
        return result;
    });
};
PhotoZoneSchema.statics.searchByKeyword = function (keyword) {
    return __awaiter(this, void 0, void 0, function* () {
        let pipeline = createInitialPipeline();
        pipeline.unshift({
            $match: {
                $or: [
                    { placeName: { $regex: new RegExp(keyword, 'i') } },
                    { title: { $regex: new RegExp(keyword, 'i') } },
                    { description: { $regex: new RegExp(keyword, 'i') } },
                    { shortDescription: { $regex: new RegExp(keyword, 'i') } },
                    { tags: { $elemMatch: { $regex: keyword, $options: 'i' } } },
                ],
            }
        });
        let result = yield PhotoZone.aggregate(pipeline);
        return result;
    });
};
PhotoZoneSchema.statics.findAll = function (page, code) {
    return __awaiter(this, void 0, void 0, function* () {
        let pipeline = createInitialPipeline(code);
        // pipeline = pagination(pipeline, page);
        let result = yield PhotoZone.aggregate(pipeline);
        return result;
    });
};
PhotoZoneSchema.virtual('likedCount', {
    ref: 'Like',
    localField: '_id',
    foreignField: 'productId',
    count: true
});
PhotoZoneSchema.virtual('viewCount', {
    ref: 'ViewCount',
    localField: '_id',
    foreignField: 'productId',
    count: true
});
PhotoZoneSchema.virtual('creator', {
    ref: 'User',
    localField: 'uid',
    foreignField: 'uid',
    justOne: true
});
function pagination(pipeline, page) {
    let pagination = [
        {
            $skip: (page - 1) * 20
        },
        {
            $limit: page
        }
    ];
    pipeline.push(pagination);
    return pipeline;
}
function createInitialPipeline(code) {
    let pipeline = [
        {
            $lookup: {
                from: "user",
                localField: "uid",
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
                likes: 0
            }
        }
    ];
    return pipeline;
}
const PhotoZone = mongoose_1.default.model("PhotoZone", PhotoZoneSchema, "photoZone");
exports.PhotoZone = PhotoZone;

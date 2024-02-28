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
});
exports.PhotoZoneSchema = PhotoZoneSchema;
PhotoZoneSchema.index({ location: "2dsphere" });
const PhotoZone = mongoose_1.default.model('PhotoZone', PhotoZoneSchema, 'photoZone');
exports.PhotoZone = PhotoZone;

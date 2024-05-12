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
exports.TrendingPoseSchema = exports.TrendingPose = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const guideline_model_1 = require("./guideline.model");
const TrendingPoseSchema = new mongoose_1.Schema({
    name: {
        required: true,
        type: String,
    },
    createdAt: {
        required: true,
        type: Number,
    },
    imageUrl: {
        type: String,
    },
    present: {
        required: true,
        type: Boolean,
    }
});
exports.TrendingPoseSchema = TrendingPoseSchema;
TrendingPoseSchema.statics.getList = function () {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const poses = yield TrendingPose.find({ present: true });
            var result = [];
            for (var pose of poses) {
                let name = pose.name;
                let guidelines = yield guideline_model_1.Guideline.getListFromTag(pose.name);
                ;
                let current = {
                    name: guidelines
                };
                result.push(current);
            }
            return result;
        }
        catch (error) {
            throw error;
        }
    });
};
const TrendingPose = mongoose_1.default.model('TrendingPose', TrendingPoseSchema, 'trendingPose');
exports.TrendingPose = TrendingPose;

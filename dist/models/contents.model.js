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
exports.ContentsSchema = exports.Contents = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ContentsSchema = new mongoose_1.Schema({
    list: {
        required: true,
        type: [
            {
                d: { type: String, required: true },
                t: { type: String, required: true },
                b: { type: String, required: true },
                s: { type: String, required: true }
            }
        ]
    },
    type: { type: String, required: true }
    /**
     * d -> displayName,
     * t-> tag,
     * b -> sort by(l: latest, p: popularity),
     * s -> sort(a: asc, d: dsc)
     *  */
});
exports.ContentsSchema = ContentsSchema;
ContentsSchema.statics.getGuidelineContents = function () {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = Contents.findOne({ type: "Guideline" }).sort({ _id: -1 });
            return result;
        }
        catch (error) {
            console.error("Error:", error);
            throw error;
        }
    });
};
ContentsSchema.statics.getFilterContents = function () {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = Contents.findOne({ type: "Filter" }).sort({ _id: -1 });
            return result;
        }
        catch (error) {
            console.error("Error:", error);
            throw error;
        }
    });
};
const Contents = mongoose_1.default.model("Contents", ContentsSchema, "contents");
exports.Contents = Contents;

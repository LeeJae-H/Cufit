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
exports.FaqSchema = exports.Faq = exports.FaqAnswerSchema = exports.FaqAnswer = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const FaqSchema = new mongoose_1.Schema({
    title: { required: true, type: String },
    uid: { required: true, type: String },
    createdAt: { required: true, type: Number },
    content: { required: true, type: String },
    faqType: {
        required: true,
        type: String,
        enum: [
            'CREDIT', 'CREATOR', 'PRODUCT', 'ETC'
        ]
    }
});
exports.FaqSchema = FaqSchema;
FaqSchema.statics.list = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const faqs = yield Faq.aggregate([
            {
                $lookup: {
                    from: 'faq_answer',
                    localField: '_id',
                    foreignField: 'faqId',
                    as: 'faqAnswers'
                }
            },
            {
                $match: {
                    faqAnswers: { $eq: [] }
                }
            }
        ]);
        return faqs;
    });
};
FaqSchema.statics.getFromUid = function (uid) {
    return __awaiter(this, void 0, void 0, function* () {
        const faqs = yield Faq.aggregate([
            {
                $lookup: {
                    from: 'faq_answer',
                    localField: '_id',
                    foreignField: 'faqId',
                    as: 'faqAnswers'
                }
            },
            {
                $match: {
                    uid: uid,
                }
            }
        ]);
        console.log(faqs);
        return faqs;
    });
};
const Faq = mongoose_1.default.model("Faq", FaqSchema, "faq");
exports.Faq = Faq;
const FaqAnswerSchema = new mongoose_1.Schema({
    faqId: { required: true, ref: 'faq', type: mongoose_1.default.Schema.Types.ObjectId },
    title: { required: true, type: String },
    content: { required: true, type: String },
    createdAt: { required: true, type: Number },
});
exports.FaqAnswerSchema = FaqAnswerSchema;
const FaqAnswer = mongoose_1.default.model("FaqAnswer", FaqAnswerSchema, "faq_answer");
exports.FaqAnswer = FaqAnswer;

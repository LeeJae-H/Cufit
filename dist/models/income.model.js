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
exports.IncomeSchema = exports.Income = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const IncomeSchema = new mongoose_1.Schema({
    uid: {
        required: true,
        type: String,
    },
    product: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        refPath: 'productType',
        required: true
    },
    productType: {
        required: true,
        type: String,
        enum: ['Filter', 'Guideline']
    },
    order: {
        required: true,
        ref: 'Order',
        type: mongoose_1.default.Schema.Types.ObjectId
    },
    status: {
        required: true,
        type: String,
        enum: ["before", "processing", "complete"],
        default: "before"
    },
    createdAt: {
        required: true,
        type: Number
    },
    settledAt: {
        type: Number
    },
    amount: {
        required: true,
        type: Number
    }
});
exports.IncomeSchema = IncomeSchema;
const Income = mongoose_1.default.model('Income', IncomeSchema, 'income');
exports.Income = Income;

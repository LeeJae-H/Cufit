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
exports.CreditTransaction = exports.Credit = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const CreditSchema = new mongoose_1.Schema({
    uid: {
        required: true,
        type: String,
    },
    amount: {
        required: true,
        type: Number,
    },
    createdAt: {
        required: true,
        type: Number
    },
    expireAt: {
        type: Number,
    },
    creditType: {
        required: true,
        type: String,
        enum: ['PURCHASE', 'ADMIN', 'AD', 'EVENT', 'REVIEW']
    },
    atid: {
        type: String
    },
});
const CreditTransactionSchema = new mongoose_1.Schema({
    transactionType: {
        required: true,
        type: String,
        enum: ['PURCHASE_PRODUCT', 'PURCHASE_CREDIT', 'REVIEW_REWARD', 'AD_REWARD']
    },
    amount: {
        required: true,
        type: Number,
    },
    createdAt: {
        required: true,
        type: Number
    },
    creditId: {
        required: true,
        type: String
    },
});
const Credit = mongoose_1.default.model('Credit', CreditSchema, 'credit');
exports.Credit = Credit;
const CreditTransaction = mongoose_1.default.model('CreditTransaction', CreditTransactionSchema, 'credit_transaction');
exports.CreditTransaction = CreditTransaction;

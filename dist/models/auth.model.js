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
exports.AuthSchema = exports.Auth = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const AuthSchema = new mongoose_1.Schema({
    productId: {
        required: true,
        type: mongoose_1.default.Schema.Types.ObjectId,
        refPath: 'productType'
    },
    productType: {
        required: true,
        type: String,
        enum: ['Filter', 'Guideline']
    },
    createdAt: {
        required: true,
        type: Number
    },
    code: {
        required: true,
        type: String,
        enum: ['authorized', 'unauthorized', 'denied']
    },
    lastAt: {
        required: true,
        type: Number
    },
    message: {
        required: true,
        type: String
    }
});
exports.AuthSchema = AuthSchema;
const Auth = mongoose_1.default.model("Auth", AuthSchema, "auth");
exports.Auth = Auth;

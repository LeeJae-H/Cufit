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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const income_1 = require("../models/income");
const admin = __importStar(require("firebase-admin"));
const router = express_1.default.Router();
router.get("/income/:idToken", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const idToken = req.params.idToken;
    try {
        const decodedToken = yield admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;
        const status = `${req.query.status}`;
        const free = req.query.free === "true";
        console.log("before result");
        const result = yield income_1.Income.find({
            uid: uid,
            status: status,
            amount: free ? { $gte: 0 } : { $gt: 0 }
        })
            .populate("product")
            .populate("order");
        console.log(result);
        res.status(200).json({
            statusCode: 0,
            message: "Successfully load incomes",
            result
        });
        return;
    }
    catch (error) {
        console.error("error");
        console.error(error);
        res.status(200).json({
            statusCode: -1,
            message: error,
            result: {}
        });
    }
}));
exports.default = router;
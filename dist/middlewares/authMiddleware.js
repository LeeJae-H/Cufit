"use strict";
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
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const logger_1 = __importDefault(require("../config/logger"));
const verifyIdToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { idToken } = req.body;
    try {
        const decodedToken = yield firebase_admin_1.default.auth().verifyIdToken(idToken);
        req.uid = decodedToken.uid;
        next();
    }
    catch (error) {
        res.status(400).json({
            statusCode: -1,
            message: 'Invalid or expired token',
            result: {}
        });
        logger_1.default.error(`Invalid or expired token: ${error}`);
    }
});
exports.default = verifyIdToken;

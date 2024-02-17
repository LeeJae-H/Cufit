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
exports.getStatus = void 0;
const servserStatus_model_1 = require("../models/servserStatus.model");
const logger_1 = __importDefault(require("../config/logger"));
const getStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const currentStatus = yield servserStatus_model_1.Status.findOne({});
    if (!currentStatus) {
        logger_1.default.error("Error get status");
        return res.status(500).json({
            statusCode: -1,
            message: "Error",
            result: {}
        });
    }
    res.status(200).json({
        statusCode: 0,
        message: "Success",
        result: currentStatus
    });
    logger_1.default.info("Successfully get status");
});
exports.getStatus = getStatus;

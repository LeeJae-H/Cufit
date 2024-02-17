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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIncome = void 0;
const income_model_1 = require("../models/income.model");
const getIncome = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const uid = req.uid;
    const status = `${req.query.status}`;
    const free = req.query.free === "true";
    try {
        const result = yield income_model_1.Income.find({
            uid: uid,
            status: status,
            amount: free ? { $gte: 0 } : { $gt: 0 }
        })
            .populate("product")
            .populate("order");
        res.status(200).json({
            statusCode: 0,
            message: "Successfully load incomes",
            result: result
        });
    }
    catch (error) {
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {}
        });
    }
});
exports.getIncome = getIncome;

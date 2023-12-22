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
const express_1 = __importDefault(require("express"));
const admin_1 = __importDefault(require("./admin"));
const filter_1 = __importDefault(require("./filter"));
const guideline_1 = __importDefault(require("./guideline"));
const image_1 = __importDefault(require("./image"));
const product_1 = __importDefault(require("./product"));
const user_1 = __importDefault(require("./user"));
const search_1 = __importDefault(require("./search"));
const servserStatus_1 = require("../models/servserStatus");
const router = express_1.default.Router();
router.use('/admin', admin_1.default);
router.use('/filter', filter_1.default);
router.use('/guideline', guideline_1.default);
router.use('/image', image_1.default);
router.use('/product', product_1.default);
router.use('/user', user_1.default);
router.use('/search', search_1.default);
router.get('/status', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const currentStatus = yield servserStatus_1.Status.findOne({});
    if (!currentStatus) {
        res.status(200).json({
            statusCode: -1,
            message: "Error",
            result: -1
        });
    }
    else {
        res.status(200).json({
            statusCode: 0,
            message: "Success",
            result: currentStatus.code
        });
    }
}));
exports.default = router;

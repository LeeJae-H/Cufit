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
exports.deleteImage = exports.uploadImage = void 0;
const storage_1 = __importDefault(require("../config/storage"));
const uuid_1 = require("uuid");
const uploadImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const file = req.file;
        const { originalname, buffer } = file;
        const key = `${(0, uuid_1.v4)()}_${originalname}`;
        const params = {
            Bucket: "cufit-staging-image-bucket",
            Key: key,
            Body: buffer,
            ContentType: file.mimetype,
        };
        const uploadResult = yield storage_1.default.upload(params).promise();
        const imageKey = uploadResult.Key;
        res.json(imageKey);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});
exports.uploadImage = uploadImage;
const deleteImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const key = req.body.key;
    try {
        const result = yield storage_1.default.deleteObject({
            Bucket: 'cufit-staging-image-bucket',
            Key: key
        }).promise();
        res.json(result);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});
exports.deleteImage = deleteImage;

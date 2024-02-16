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
const uploadImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const type = req.body.type;
        const file = req.file;
        const { originalname, buffer } = file;
        const fileType = originalname.split('.').pop();
        const params = {
            Bucket: "cufit-staging-image-bucket",
            Key: `${type}/${Date.now()}.${fileType}`,
            Body: buffer,
            ContentType: file.mimetype,
        };
        const uploadResult = yield storage_1.default.upload(params).promise();
        const imageUrl = uploadResult.Location;
        res.status(200).json({
            statusCode: 0,
            message: "Successfully image uploaded",
            result: {
                url: imageUrl,
                type: type
            }
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
exports.uploadImage = uploadImage;
const deleteImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const fileName = req.body.fileName;
    const type = req.body.type;
    try {
        const result = yield storage_1.default.deleteObject({
            Bucket: 'cufit-staging-image-bucket',
            Key: `${type}/${fileName}.png`
        }).promise();
        res.status(200).json({
            statusCode: 0,
            message: "Successfully image deleted",
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
exports.deleteImage = deleteImage;

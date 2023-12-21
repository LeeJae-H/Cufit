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
const formidable_1 = __importDefault(require("formidable"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const fs_1 = __importDefault(require("fs"));
const router = express_1.default.Router();
const s3 = new aws_sdk_1.default.S3({
    accessKeyId: 'AKIAXCOGHQE4QCHHWEFA',
    secretAccessKey: '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',
    region: 'ap-southeast-2'
});
router.post("/upload", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const form = (0, formidable_1.default)({ multiples: true });
    form.parse(req, (error, fields, files) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        if (error) {
            res.status(200).json({
                statusCode: -1,
                message: error,
                result: {}
            });
            return;
        }
        const fFiles = (_a = files.image) !== null && _a !== void 0 ? _a : [];
        const image = fFiles[0];
        const type = fields.type;
        const fileType = (_b = image.originalFilename) === null || _b === void 0 ? void 0 : _b.split('.').pop(); // 파일의 확장자 
        if (!image || !type || !fileType) {
            res.status(200).json({
                statusCode: -1,
                message: "not essential input.",
                result: {}
            });
            return;
        }
        let imageUrl = "";
        try {
            if (image.size !== 0) {
                const file = fs_1.default.readFileSync(image.filepath);
                const uploadParams = {
                    Bucket: 'cufit-image-bucket',
                    Key: `${type}/${Date.now()}.${fileType}`,
                    Body: file,
                };
                console.log("after params", image.filepath);
                let data = yield s3.upload(uploadParams).promise();
                imageUrl = data.Location;
                res.status(200).json({
                    statusCode: 0,
                    message: "Image uploaded successfully.",
                    result: {
                        url: imageUrl,
                        type: type
                    }
                });
                return;
            }
            else {
                res.status(200).json({
                    statusCode: -1,
                    message: "image file size is zero.",
                    result: {}
                });
                return;
            }
        }
        catch (error) {
            res.status(200).json({
                statusCode: -1,
                message: error,
                result: {}
            });
            return;
        }
    }));
}));
router.delete("/delete", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const fileName = req.body.fileName;
    const type = req.body.type;
    const bucketName = 'cufit-image-bucket';
    //* 단일 객체 삭제
    const objectParams_del = {
        Bucket: bucketName,
        Key: `${type}/${fileName}.png`
    };
    try {
        let result = yield s3.deleteObject(objectParams_del).promise();
        res.status(200).json({
            statusCode: 0,
            message: "Success",
            result
        });
    }
    catch (error) {
        console.error(error);
        res.status(200).json({
            statusCode: -1,
            message: error,
            result: {}
        });
        return;
    }
}));
exports.default = router;

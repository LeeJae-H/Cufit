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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const index_1 = __importDefault(require("./routes/index"));
const mongoose_1 = __importDefault(require("mongoose"));
const admin = __importStar(require("firebase-admin"));
const firebasekey_json_1 = __importDefault(require("./firebasekey.json"));
admin.initializeApp({
    credential: admin.credential.cert(firebasekey_json_1.default)
});
const uri = 'mongodb+srv://jhlee:jhlee@imicainstance.h807wuk.mongodb.net/Cufit?retryWrites=true&w=majority';
const app = (0, express_1.default)();
const port = 3030;
let setCache = function (req, res, next) {
    const period = 60 * 5;
    if (req.method == 'GET') {
        res.set('Cache-control', `public, max-age=${period}`);
    }
    else {
        res.set('Cache-control', 'no-store');
    }
    next();
};
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cors_1.default)({ origin: true, credentials: true }));
app.use('/', index_1.default);
app.use(setCache);
try {
    mongoose_1.default.connect(uri);
}
catch (error) {
    console.error("Cannot connect to mongodb with mongoose.");
    console.error("-------------------Reason----------------");
    console.error(error);
    console.error("-------------------Reason----------------");
}
console.log("Successfully connected to mongodb!");
app.listen(port, () => {
    console.log(`Server is running at ${port}`);
});

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const database_1 = __importDefault(require("./config/database"));
const firebase_1 = __importDefault(require("./config/firebase"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const index_1 = __importDefault(require("./routes/index"));
const cache_1 = __importDefault(require("./middlewares/cache"));
(0, database_1.default)(); // 데이터베이스 연결
(0, firebase_1.default)(); // Firebase Admin SDK 초기화
// express 애플리케이션 객체 생성 -> express 애플리케이션 객체는 미들웨어 추가, 라우팅 설정 등의 다양한 기능을 제공한다.
const app = (0, express_1.default)();
// 미들웨어 : CORS 설정 -> 서버로 들어오는 모든 클라이언트 요청에 대해 CORS를 허용한다.
app.use((0, cors_1.default)({ origin: true, credentials: true }));
// 미들웨어 : 데이터 파싱 설정 -> 클라이언트에서 전송한 HTTP 요청의 본문(body)에 있는 데이터를 파싱하여 express 애플리케이션에서 사용할 수 있도록 해준다. 라우팅 핸들러(controller)에서 req.body를 통해 파싱된 데이터에 접근할 수 있다.
app.use(express_1.default.json()); // application/json
app.use(express_1.default.urlencoded({ extended: false })); // application/x-www-form-urlencoded
// multipart/form-data 를 위해서 multer를 사용하는데, multer는 서버 전체에 적용되지 않고 필요한 부분에서만 사용한다.
app.use(cache_1.default);
// 미들웨어 : 라우터 설정 -> 코드를 모듈화하여 코드 관리하기 용이해지며, 특정 경로에 대한 요청 처리를 분리한다.
app.use('/', index_1.default);
// 서버 시작 ->  express 애플리케이션을 특정 포트에서 시작
app.listen(process.env.PORT, () => {
    console.log(`Server is running at http://localhost:${process.env.PORT}`);
});

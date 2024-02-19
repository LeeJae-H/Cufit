"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const app_root_path_1 = __importDefault(require("app-root-path"));
const logDir = `${app_root_path_1.default}/src/logs`;
const { combine, timestamp, printf } = winston_1.default.format;
const logFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
});
/*
 * Log Level
 * error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6
 */
const logger = winston_1.default.createLogger({
    // 로그 형식 지정
    format: combine(timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
    }), logFormat),
    // 로그 저장 방식 정의
    transports: [
        // info 레벨 로그를 저장할 파일 설정
        new winston_daily_rotate_file_1.default({
            level: 'info',
            datePattern: 'YYYY-MM-DD',
            dirname: logDir + '/info',
            filename: `%DATE%.log`,
            maxFiles: 30, // 30일치 로그 파일 저장
            zippedArchive: true,
        }),
        // error 레벨 로그를 저장할 파일 설정
        new winston_daily_rotate_file_1.default({
            level: 'error',
            datePattern: 'YYYY-MM-DD',
            dirname: logDir + '/error', // error.log 파일은 /logs/error 하위에 저장 
            filename: `%DATE%.error.log`,
            maxFiles: 30,
            zippedArchive: true,
        }),
    ],
    // exceptionHandlers: [
    //   new winstonDaily({
    //       level: 'error',
    //       datePattern: 'YYYY-MM-DD',
    //       dirname: logDir + '/exception',
    //       filename: '%DATE%.exception.log',
    //       maxFiles: 30,
    //       zippedArchive: true,
    //   })
    // ]
});
// Production 환경이 아닌 경우(dev 등) : 파일과 화면에도 log 출력
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston_1.default.transports.Console({
        format: winston_1.default.format.combine(winston_1.default.format.colorize(), // 색깔 넣어서 출력
        winston_1.default.format.simple())
    }));
}
exports.default = logger;

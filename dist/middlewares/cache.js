"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cacheMiddleware = (req, res, next) => {
    // const period = 60 * 5; // 5분
    const period = 10;
    if (req.method === 'GET') {
        res.set('Cache-control', `public, max-age=${period}`);
    }
    else {
        res.set('Cache-control', 'no-store');
    }
    next();
};
exports.default = cacheMiddleware;

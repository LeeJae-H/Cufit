"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
const photoZone_controller_1 = require("../controllers/photoZone.controller");
const router = express_1.default.Router();
router.post('/', photoZone_controller_1.uploadPhotozone);
router.delete('/:id', authMiddleware_1.default, photoZone_controller_1.deletePhotozone);
router.patch('/', authMiddleware_1.default, photoZone_controller_1.updatePhotozone);
router.get('/near', photoZone_controller_1.getPhotozoneByDistance);
router.get('/:keyword/search', photoZone_controller_1.searchPhotozones);
router.get('/:photoZoneId/detail', photoZone_controller_1.getDetail);
exports.default = router;

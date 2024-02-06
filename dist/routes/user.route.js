"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const router = express_1.default.Router();
router.post("/auth", user_controller_1.login); // idtoken 받아서 앱에 로그인
router.get("/profile/uid/:uid", user_controller_1.getProfileByUid); // uid로 사용자 정보 조회
router.post("/profile", user_controller_1.fixProfile); // idtoen 받아서 사용자 정보 수정
router.delete("/user", user_controller_1.deleteUser); // idtoken 받아서 사용자 삭제
router.post("/faq", user_controller_1.faqUpload);
router.get('/faq/list/:uid', user_controller_1.getFaq);
router.post("/products", user_controller_1.findProducts);
router.post("/follow", user_controller_1.follow); // follow 하기
router.get("/follow/check", user_controller_1.checkFollow); // follow 되었는지 확인하기
router.get("/follower/:uid", user_controller_1.getFollower); // 팔로워 리스트 가져오기
router.get("/following/:uid", user_controller_1.getFollowing); // 팔로잉 리스트 가져오기
router.post("/manage/products", user_controller_1.getProductsByUid); // 사용자가 올린 가이드라인, 필터 조회
router.get("/wishlist/:uid", user_controller_1.getWishlistByUid); // uid로 wishlist 조회
router.get("/likelist/:uid", user_controller_1.getLikelistByUid); // uid로 likelist 조회
router.get("/transactions/:idToken", user_controller_1.getCreditTransaction); // idtoken 받아서 credit transaction 조회
router.get("/adreward/amount", user_controller_1.getAdrewardAmount);
router.post("/adreward", user_controller_1.getAdreward); // 광고 시청으로 얻은 credit
router.post('/credit/purchase', user_controller_1.purchaseCredit); // 인앱 결제로 구매한 credit
router.post("/purchase", user_controller_1.purchaseProduct); // product 구매
exports.default = router;

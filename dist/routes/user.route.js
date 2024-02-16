"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
const user_controller_1 = require("../controllers/user.controller");
const router = express_1.default.Router();
router.post("/login", user_controller_1.login); // idtoken 받아서 앱에 로그인
router.get("/:uid", user_controller_1.getUserProfile); // uid로 사용자 정보 조회
router.post("/", authMiddleware_1.default, user_controller_1.updateUserProfile); // idtoken 받아서 사용자 정보 수정
router.delete("/", authMiddleware_1.default, user_controller_1.deleteUser); // idtoken 받아서 사용자 정보 삭제
router.get("/:uid/follower-list", user_controller_1.getFollowerList); // 팔로워 리스트 가져오기
router.get("/:uid/following-list", user_controller_1.getFollowingList); // 팔로잉 리스트 가져오기
router.get('/:uid/faq-list', user_controller_1.getFaqList); // uid로 faqlist 조회
router.get("/:uid/like-list", user_controller_1.getLikeList); // uid로 likelist 조회
router.get("/:uid/wish-list", user_controller_1.getWishList); // uid로 wishlist 조회
router.get("/:uid/product-list", user_controller_1.getProductList); // 사용자가 올린 가이드라인, 필터 조회
router.get("/follow", user_controller_1.checkFollow); // follow 되었는지 확인하기
router.post("/follow", user_controller_1.toggleFollow); // follow 또는 unfollow 하기
router.post("/faq", user_controller_1.uploadFaq); // 문의하기
router.post("/product/like", user_controller_1.likeProduct); // product like 하기
router.post("/product/wish", user_controller_1.wishProduct); // product wish 하기
router.post("/product/buy", authMiddleware_1.default, user_controller_1.buyProduct); // product 구매
router.post("/product/use", authMiddleware_1.default, user_controller_1.useProduct); // 제품 사용
router.post("/product/review", authMiddleware_1.default, user_controller_1.reviewProduct); // product review 쓰기
router.get("/transaction-credit", authMiddleware_1.default, user_controller_1.getCreditTransaction); // idtoken 받아서 credit transaction 조회 
router.get("/reward-advertisement", user_controller_1.getAdrewardAmount); // 광고 시청으로 얻을 수 있는 credit 양
router.post("/credit-advertisement", authMiddleware_1.default, user_controller_1.getAdreward); // 광고 시청으로 얻은 credit
router.post('/credit-purchase', user_controller_1.purchaseCredit); // 인앱 결제로 credit 구매
exports.default = router;

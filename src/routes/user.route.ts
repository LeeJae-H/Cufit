import express from 'express';
import verifyIdToken from '../middlewares/authMiddleware';
import { login, getUserProfile, updateUserProfile, deleteUser, 
    getFollowerList, getFollowingList, getFaqList, getLikeList, getWishList, getProductList,
    checkFollow, toggleFollow, uploadFaq, likeProduct, wishProduct, buyProduct, reviewProduct,
    getCreditTransaction, getAdrewardAmount, getAdreward, purchaseCredit, getPurchasedList, 
} from '../controllers/user.controller';

const router = express.Router();

router.post("/login", login); // idtoken 받아서 앱에 로그인
router.get("/:uid/profile",getUserProfile); // uid로 사용자 정보 조회
router.post("/", verifyIdToken, updateUserProfile); // idtoken 받아서 사용자 정보 수정
router.delete("/", verifyIdToken, deleteUser); // idtoken 받아서 사용자 정보 삭제

router.get("/:uid/follower-list", getFollowerList); // 팔로워 리스트 가져오기
router.get("/:uid/following-list", getFollowingList); // 팔로잉 리스트 가져오기
router.get('/:uid/faq-list', getFaqList); // uid로 faqlist 조회
router.get("/:uid/like-list", getLikeList); // uid로 likelist 조회
router.get("/:uid/wish-list", getWishList); // uid로 wishlist 조회
router.get("/:uid/product-list", getProductList); // 사용자가 올린 가이드라인, 필터 조회
router.get("/:uid/purchased-list", getPurchasedList); // 구매한 제품 조회

router.get("/follow", checkFollow); // follow 되었는지 확인하기
router.post("/follow", toggleFollow); // follow 또는 unfollow 하기
router.post("/faq", uploadFaq); // 문의하기
router.post("/product/like", likeProduct); // product like 하기
router.post("/product/wish", wishProduct); // product wish 하기
router.post("/product/buy", verifyIdToken, buyProduct); // product 구매
router.post("/product/review", verifyIdToken, reviewProduct); // product review 쓰기

// veryfyIdToken 미들웨어를 거치는 api는 모두 post 요청으로 (단순조회를 하더라도)
router.post("/transaction-credit", verifyIdToken, getCreditTransaction); // idtoken 받아서 credit transaction 조회 
router.get("/reward-advertisement", getAdrewardAmount); // 광고 시청으로 얻을 수 있는 credit 양
router.post("/credit-advertisement", verifyIdToken, getAdreward); // 광고 시청으로 얻은 credit
router.post('/credit-purchase', purchaseCredit); // 인앱 결제로 credit 구매

export default router;
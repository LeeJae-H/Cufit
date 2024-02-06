import express from 'express';
import { login, getProfileByUid, fixProfile, deleteUser, 
    faqUpload, getFaq, findProducts, 
    follow, checkFollow, getFollower, getFollowing,
    getProductsByUid, getWishlistByUid, getLikelistByUid, getCreditTransaction,
    getAdrewardAmount, getAdreward, purchaseCredit, purchaseProduct 
} from '../controllers/user.controller';

const router = express.Router();

router.post("/auth", login); // idtoken 받아서 앱에 로그인
router.get("/profile/uid/:uid",getProfileByUid); // uid로 사용자 정보 조회
router.post("/profile", fixProfile); // idtoen 받아서 사용자 정보 수정
router.delete("/user", deleteUser); // idtoken 받아서 사용자 삭제
router.post("/faq", faqUpload); 
router.get('/faq/list/:uid', getFaq);
router.post("/products", findProducts);
router.post("/follow", follow); // follow 하기
router.get("/follow/check", checkFollow); // follow 되었는지 확인하기
router.get("/follower/:uid", getFollower); // 팔로워 리스트 가져오기
router.get("/following/:uid", getFollowing); // 팔로잉 리스트 가져오기
router.post("/manage/products", getProductsByUid); // 사용자가 올린 가이드라인, 필터 조회
router.get("/wishlist/:uid", getWishlistByUid); // uid로 wishlist 조회
router.get("/likelist/:uid", getLikelistByUid); // uid로 likelist 조회
router.get("/transactions/:idToken", getCreditTransaction); // idtoken 받아서 credit transaction 조회
router.get("/adreward/amount", getAdrewardAmount); 
router.post("/adreward", getAdreward); // 광고 시청으로 얻은 credit
router.post('/credit/purchase', purchaseCredit); // 인앱 결제로 구매한 credit
router.post("/purchase", purchaseProduct); // product 구매

export default router;

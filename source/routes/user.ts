import express from "express";
import mongoose from "mongoose";
import axios from 'axios';

// router 객체
const router = express.Router();
import * as admin from "firebase-admin";

import { User } from "../models/user";
import { Follow } from "../models/follow";
import { Wish } from "../models/wish";
import { Like } from '../models/like';
import { Filter } from '../models/filter';
import { Guideline } from '../models/guideline';
import { Credit, CreditTransaction } from "../models/credit";
import { Order } from '../models/order';
import { Income } from "../models/income";
import { Faq } from '../models/faq';


router.post("/auth", async (req, res) => {
  const { idToken } = req.body;

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // 데이터베이스에서 uid 조회
    const userData = await User.getFromUid(uid);
    if (userData) {
      // 이미 해당 uid를 가지는 사용자 정보가 있는 경우
      res.status(200).json(userData);
    } else {
      // 해당 uid를 가지는 사용자 정보가 없는 경우
      const newUser = await User.createNewUser(decodedToken);
      res.status(200).json(newUser);
    }
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: error });
  }
});

router.get("/profile/uid/:uid", async (req, res) => {
  const uid = req.params.uid;

  try {
    // 데이터베이스에서 uid 조회
    const user = await User.getFromUid(uid);

    if (user) {
      res.status(200).json({
        user: user
      });
    } else {
      res.status(201).json({
        message: "User not found"
      });
    }
  } catch (error) {
    console.error(error);
    res.status(401).json({
      error: error
    });
  }  
})

router.post("/faq", async (req, res) => {
  const { uid, title, content, type } = req.body;
  if (!uid || !title || !content || !type) {
    res.status(200).json({
      statusCode: -1,
      message: "essential data not found.",
      result: {}
    })
  }
  const faqData = {
    uid, title, content, faqType: type, createdAt: Date.now()
  }
  const newFaq = new Faq(faqData);
  await newFaq.save();
  res.status(200).json({
    statusCode: 0,
    message: "faq uploaded successfully.",
    result: newFaq
  })
})

router.get('/faq/list/:uid', async (req, res) => {
  const uid = req.params.uid;
  const result = await Faq.getFromUid(uid);
  res.status(200).json({
    statusCode: 0,
    message: "List read.",
    result
  })
})

// idToken을 받아서 user 정보 수정하기
router.post("/profile", async (req, res) => {
  const { idToken, bio, displayName, instagramName, tiktokName, youtubeName } = req.body;
  const newUserData = {
    bio: bio,
    displayName: displayName,
    instagramName: instagramName,
    tiktokName: tiktokName,
    youtubeName: youtubeName
  }
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // 데이터베이스에서 uid 조회
    await User.findOneAndUpdate({ uid: uid }, { $set: newUserData });
    const result = await User.getFromUid(uid);
    console.log(result)
    res.status(200).json({
      message: "Successfully updated!",
      result: result
    });
  } catch (error) {
    console.error(error)
    res.status(401).json({
      error: error
    });
  }  
});

router.post("/products", async (req, res) => {
  const productInUse = req.body.productInUse;
  const idToken = req.body.idToken;
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const result = await User.findOneAndUpdate({ uid: uid }, { $set: { productInUse: productInUse } });

    res.status(200).json({
      message: "Successfully updated!",
      result: result
    });
  } catch(error) {
    res.status(401).json({
      error: error
    });
  }
})

router.post("/follow", async (req, res) => {
  const { srcUid, dstUid } = req.body;
  try {
    const srcExist = await User.exists({ uid: srcUid });
    const dstExist = await User.exists({ uid: dstUid });
    if (!srcExist) {
      res.status(201).json({
        message: "Source user not found."
      });
      return;
    }
    if (!dstExist) {
      res.status(202).json({
        message: "Destination user not found."
      });
      return;
    }
    
    const result = await Follow.follow(srcUid, dstUid);
    res.status(200).json({
      message: result ? "Successfully followed" : "Successfully unfollowed",
      following: result,
      dstUid: dstUid
    });
  } catch(error) {
    res.status(401).json({
      error: error
    });
  }
})

router.get("/follow/check", async (req, res) => {
  const srcUid = req.query.src as string;
  const dstUid = req.query.dst as string;
  if (!srcUid || !dstUid) {
    console.error("src or dst not found");
    res.status(202).json({
      message: "query not found."
    })
    return;
  }
  try {
    const srcExist = await User.exists({ uid: srcUid });
    const dstExist = await User.exists({ uid: dstUid });
    if (!srcExist) {
      res.status(201).json({
        message: "Source user not found."
      });
      return;
    }
    if (!dstExist) {
      res.status(202).json({
        message: "Destination user not found."
      });
      return;
    }
    
    const result = await Follow.isFollowed(srcUid, dstUid);
    res.status(200).json({
      message: result ? "Successfully followed" : "Successfully unfollowed",
      following: result,
      dstUid: dstUid
    });
  } catch(error) {
    res.status(401).json({
      error: error
    });
  }
})

router.post("/manage/products", async (req, res) => {
  const idToken = req.body.idToken;
  try {
    console.log("decoding")
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    console.log("decoding complete")
    const filters = await Filter.getListFromCreatorUid(uid, "all");
    const guidelines = await Guideline.getListFromCreatorUid(uid, "all");
    console.log("filter, guideline loaded")
    console.log(filters)
    console.log(guidelines)
    res.status(200).json({
      statusCode: 0,
      message: "successfully read products",
      result: {
        filters,
        guidelines
      }
    })
  } catch(error) {
    console.error("error occured")
    console.error(error);
    res.status(200).json({
      statusCode: -1,
      message: error,
      result: {
        filters: [],
        guidelines: []
      }
    })
  }
})

router.get("/wishlist/:uid", async (req, res) => {
  const uid = req.params.uid;
  const wishlist = await Wish.find({uid: uid});
  const filterIds = wishlist.filter(wish => wish.productType === "Filter")
  .map(wish => wish.productId)
  const guidelineIds = wishlist.filter(wish => wish.productType === "Guideline")
  .map(wish => wish.productId)
  const filters = await Filter.find({_id: { $in: filterIds }})
    .populate('likedCount')
    .populate('wishedCount')
    .populate('usedCount')
    .populate('creator');
  const guidelines = await Guideline.find({ _id: { $in: guidelineIds } })
    .populate('likedCount')
    .populate('wishedCount')
    .populate('usedCount')
    .populate('creator');
  res.status(200).json({
    filters: filters,
    guidelines: guidelines,
    message: "Successfully read wishlist."
  })
})

router.get("/likelist/:uid", async (req, res) => {
  const uid = req.params.uid;
  const likelist = await Like.find({uid: uid});
  const filterIds = likelist.filter(like => like.productType === "Filter")
  .map(like => like.productId);
  const guidelineIds = likelist.filter(like => like.productType === "Guideline")
  .map(like => like.productId)
  const filters = await Filter.find({_id: { $in: filterIds }})
    .populate('likedCount')
    .populate('wishedCount')
    .populate('usedCount')
    .populate('creator');
  const guidelines = await Guideline.find({ _id: { $in: guidelineIds } })
    .populate('likedCount')
    .populate('wishedCount')
    .populate('usedCount')
    .populate('creator');
  res.status(200).json({
    filters: filters,
    guidelines: guidelines,
    message: "Successfully read wishlist."
  })
})

router.get("/transactions/:idToken", async (req, res) => {
  const idToken = req.params.idToken;
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const credits = await Credit.find({uid: uid})
    const transactions = await CreditTransaction.find({creditId: { $in: credits.map(credit => credit._id)}})

    res.status(200).json({
      message: "Successfully updated!",
      transactions
    });
  } catch(error) {
    res.status(401).json({
      error: error
    });
  }
})

// 인앱 결제로 구매한 credit (광고 시청 등으로 얻은 credit x)
router.post('/credit/purchase', async (req, res) => {
  try {
    const { uid, atid } = req.body;

    const receiptData = req.body.receiptData;
    const appleProductionURL = 'https://buy.itunes.apple.com/verifyReceipt'; // Production URL
    const appleSandboxURL = 'https://sandbox.itunes.apple.com/verifyReceipt'; // Sandbox URL
    const password = '71ede09526bb4a599f1e777e1f25c98e';

    const response = await axios.post(appleProductionURL, {
      "receipt-data": receiptData,
      "password": password
    })
    const verificationResult = await response.data;
    
    if (verificationResult.status === 0) {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        const existOrder = await Credit.find({ uid: uid, atid: atid }).session(session);
        if (existOrder.length > 0) {
          res.status(400).json({
            error: "this transaction already created."
          })
          return;
        }
        const receipts = verificationResult.receipt.in_app
        const availableReceipts = receipts.filter((element: any) => {
          return element.original_transaction_id === atid;
        });
        const amount = parseInt(availableReceipts[0].product_id.split('_').pop());
        const currentTime = Date.now();
        const creditInfo = {
          uid: uid,
          amount: amount,
          createdAt: currentTime,
          expireAt: -1,
          atid: atid,
          creditType: "PURCHASE"
        };
        const newCredit = new Credit(creditInfo)
        const newTransaction = new CreditTransaction({
          creditId: newCredit._id,
          amount: amount,
          createdAt: currentTime,
          transactionType: "PURCHASE_CREDIT"
        })
        await newCredit.save({session})
        await newTransaction.save({session})
        await session.commitTransaction();
        res.status(200).json({ message: 'Credit purchase verified and saved successfully', newCredit, newTransaction });
      } catch(error) {
        await session.abortTransaction();
        throw error
      } finally {
        session.endSession();
      }
    } else if (verificationResult.status === 21007) { // Sandbox용 결제인 경우 Sandbox URL로 재검증 요청
      const existOrder = await Credit.find({ uid: uid, atid: atid });
      if (existOrder.length > 0) {
        res.status(400).json({
          error: "this transaction already created."
        })
        return;
      }
      const sandboxResponse = await axios.post(appleSandboxURL, {
        "receipt-data": receiptData,
        "password": password
      })
      const sandboxVerificationResult = await sandboxResponse.data;

      if (sandboxVerificationResult.status === 0) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
          const receipts = sandboxVerificationResult.receipt.in_app
          const availableReceipts = receipts.filter((element: any) => {
            return element.original_transaction_id === atid;
          });
          const amount = parseInt(availableReceipts[0].product_id.split('_').pop());
          const currentTime = Date.now();
          const creditInfo = {
            uid: uid,
            amount: amount,
            createdAt: currentTime,
            expireAt: -1,
            atid: atid,
            creditType: "PURCHASE"
          };
          const newCredit = new Credit(creditInfo)
          const newTransaction = new CreditTransaction({
            creditId: newCredit._id,
            amount: amount,
            createdAt: currentTime,
            transactionType: "PURCHASE_CREDIT"
          })
          await newCredit.save({session})
          await newTransaction.save({session})
          await session.commitTransaction();
          res.status(200).json({ message: 'Credit purchase verified and saved successfully', newCredit, newTransaction });
        } catch(error) {
          await session.abortTransaction();
          throw error
        } finally {
          session.endSession();
        }
      } else {
        res.status(400).json({ error: 'Invalid receipt even in Sandbox', details: sandboxVerificationResult });
      }
    
    } else {
      console.log(verificationResult)
      res.status(400).json({ error: 'Invalid receipt', details: verificationResult });
    }
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while verifying credit purchase', details: error });
  }
});

router.post("/purchase", async (req, res) => {
  const idToken = req.body.idToken;
  const productId = req.body.productId;
  const productType = req.body.productType;
  let uid: string = "";
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    uid = decodedToken.uid;
  } catch(error) {
    console.error("error while verify ifToken.")
    console.error(error);
    res.status(401).json({error});
  }
  if (uid === "") {
    res.status(401).json({
      error: "Cannot verify idToken."
    })
  }
  // 이미 구매한 제품인지 확인하는 프로세스
  const existOrder = await Order.findOne({ uid: uid, productId: productId, productType: productType })
  if (existOrder) {
    res.status(202).json({
      message: "User already purchased this product.",
      productId,
      productType,
      uid
    })
    return;
  }
  let product: any = {};
  try {
    if (productType === "Filter") {
      product = await Filter.getFromObjId(productId);
    } else if (productType === "Guideline") {
      product = await Guideline.getFromObjId(productId);
    }
  } catch(error) {
    console.error("Error while load product data");
    console.error(`productType=${productType}, productId=${productId}`);
    console.error(error);
    res.status(402).json({
      productType,
      productId,
      error
    })
  }
  let productPrice = parseInt(`${product.credit}`);
  const currentTime = Date.now();
  let credits = await Credit.find({
    uid: uid,
    amount: { $gt: 0 },
    $or: [
      { expireAt: { $gt: currentTime } }, 
      { expireAt: -1 } 
    ]
  }).sort({ expireAt: 1 });
  let transactionObjects: any[] = []
  for (let i = 0; i < credits.length; i++) {
    let credit = credits[i];
    const result = credit.amount - productPrice;
    if (result >= 0) {
      credits[i].amount -= productPrice;
      let transaction = {
        creditId: credits[i]._id,
        amount: -productPrice,
        transactionType: "PURCHASE_PRODUCT",
        createdAt: currentTime
      }
      transactionObjects.push(transaction);
      productPrice = 0;
      break;
    } else {
      productPrice -= credits[i].amount;
      let transaction = {
        creditId: credits[i]._id,
        amount: -credits[i].amount,
        transactionType: "PURCHASE_PRODUCT",
        createdAt: currentTime
      }
      transactionObjects.push(transaction);
      credits[i].amount = 0;
    }
  }
  if (productPrice > 0) {
    res.status(201).json({
      message: "Not enough credits to purchase this product.",
      credits_of: productPrice
    })
    return;
  }
  let orderId: string = "";
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    for (let credit of credits) {
      await credit.save({ session });
    }
  
    for (let data of transactionObjects) {
      const transaction = new CreditTransaction(data);
      await transaction.save({ session });
    }
    const order = new Order({
      uid: uid,
      productId: productId,
      productType: productType,
      createdAt: currentTime,
      orderType: "CREDIT"
    })
    await order.save({ session });
    orderId = `${order._id}`;
    const income = new Income({
      uid: product.creatorUid,
      orderId: orderId,
      createdAt: currentTime,
      isSettled: false,
      amount: parseInt(`${product.credit}`)
    })
    await income.save({ session });
    await session.commitTransaction();
  } catch(error) {
    await session.abortTransaction();
    console.error("purchase transaction failed.")
    console.error("Due to :")
    console.error(error)
    res.status(400).json({
      error
    })
  } finally {
    session.endSession();
  }
  const user = await User.getFromUid(uid);
  res.status(200).json({
    message: "Successfully purchase product!",
    user,
    productId,
    productPrice: product.credit,
    productType,
    purchasedAt: currentTime,
    orderId: orderId
  })
})

export default router;

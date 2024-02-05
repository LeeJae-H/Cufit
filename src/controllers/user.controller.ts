import { Request, Response } from 'express';
import * as admin from "firebase-admin";
import { User } from '../models/user.model';
import { Faq } from '../models/faq.model';
import { Follow } from '../models/follow.model';
import { Guideline } from '../models/guideline.model';
import { Filter } from '../models/filter.model';
import { Wish } from '../models/wish.model';
import { Like } from '../models/like.model';
import { Credit, CreditTransaction } from "../models/credit.model";
import mongoose from "mongoose";
const adReward = 1;
import axios from 'axios';
import { Order } from '../models/order.model';
import { Income } from "../models/income.model";

export const login = async (req: Request, res: Response) => {
  const { idToken } = req.body;

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    console.log(decodedToken)
    console.log(uid)
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
};

export const getProfileByUid = async (req: Request, res: Response) => {
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
};

export const fixProfile = async (req: Request, res: Response) => {
  const { idToken, bio, displayName, instagramName, tiktokName, youtubeName, photoURL } = req.body;
  const newUserData = {
    bio: bio,
    displayName: displayName,
    instagramName: instagramName,
    tiktokName: tiktokName,
    youtubeName: youtubeName,
    photoURL: photoURL
  }
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // 데이터베이스에서 uid 조회
    await User.findOneAndUpdate({ uid: uid }, { $set: newUserData });
    const result = await User.getFromUid(uid);
    console.log(result)
    res.status(200).json({
      statusCode: 0,
      message: "Successfully updated!",
      result: result
    });
  } catch (error) {
    console.error(error)
    res.status(200).json({
      statusCode: -1,
      message: error,
      result: {}
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { idToken } = req.body;

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    await admin.auth().deleteUser(uid)
    await User.deleteOne({uid});
    res.status(200).json({
      statusCode: 0,
      message: "success",
      result: {}
    })
  } catch(error) {
    console.log("try failed due to:");
    console.error(error)
    res.status(200).json({
      statusCode: -1,
      message: error,
      result: {}
    })
  }
};

export const faqUpload = async (req: Request, res: Response) => {
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
};

export const getFaq = async (req: Request, res: Response) => {
  const uid = req.params.uid;

  const result = await Faq.getFromUid(uid);
  res.status(200).json({
    statusCode: 0,
    message: "List read.",
    result
  })
};

export const findProducts = async (req: Request, res: Response) => {
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
};

export const follow = async (req: Request, res: Response) => {
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
};

export const checkFollow = async (req: Request, res: Response) => {
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
};

export const getFollower = async (req: Request, res: Response) => {
  try {
    const uid = req.params.uid;
    const follower = await Follow.find({ dstUid: uid }).select('srcUid');
    const followerIds = follower.map(follower => follower.srcUid);
    const followerList = await User.find({ uid: { $in: followerIds } });
    res.json(followerList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getFollowing = async (req: Request, res: Response) => {
  try {
    const uid = req.params.uid;
    const following = await Follow.find({ srcUid: uid }).select('dstUid');
    const followingIds = following.map(following => following.dstUid);
    const followingList = await User.find({ uid: { $in: followingIds } });
    res.json(followingList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getProductsByUid = async (req: Request, res: Response) => {
  const idToken = req.body.idToken;
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const filters = await Filter.getListFromCreatorUid(uid);
    const guidelines = await Guideline.getListFromCreatorUid(uid);

    res.status(200).json({
      statusCode: 0,
      message: "successfully read products",
      result: {
        filters,
        guidelines
      }
    })
  } catch(error) {
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
};

export const getWishlistByUid = async (req: Request, res: Response) => {
  const uid = req.params.uid;

  try {
    const wishlistData = await Wish.getWishlist(uid);

    res.status(200).json({
      statusCode: 0,
      message: 'Successfully read wishlist.',
      result:{
        filters: wishlistData.filters,
        guidelines: wishlistData.guidelines,
      }
    });
  } catch (error) {
    console.error('Error :', error);
    res.status(500).json({
      statusCode: -1,
      message: error,
      result:{
        filters:[],
        guidelines: []
      }
    });
  }
};

export const getLikelistByUid = async (req: Request, res: Response) => {
  const uid = req.params.uid;

  try {
    const likelistData = await Like.getLikelist(uid);

    res.status(200).json({
      statusCode: 0,
      message: 'Successfully read likelist.',
      result:{
        filters: likelistData.filters,
        guidelines: likelistData.guidelines,
      }
    });
  } catch (error) {
    console.error('Error :', error);
    res.status(500).json({
      statusCode: -1,
      message: error,
      result:{
        filters:[],
        guidelines: []
      }
    });
  }
};

export const getCreditTransaction = async (req: Request, res: Response) => {
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
};

export const getAdrewardAmount = async (req: Request, res: Response) => {
  res.status(200).json({
    statusCode: 0,
    message: "Success",
    result: adReward
  })
};

export const getAdreward = async (req: Request, res: Response) => {
  const idToken = req.body.idToken;
  const session = await mongoose.startSession();
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    session.startTransaction();
    const currentTime = Date.now();
    const creditInfo = {
      uid: uid,
      amount: adReward,
      createdAt: currentTime,
      expireAt: -1,
      creditType: "AD"
    };
    const newCredit = new Credit(creditInfo)
    const newTransaction = new CreditTransaction({
      creditId: newCredit._id,
      amount: adReward,
      createdAt: currentTime,
      transactionType: "AD_REWARD"
    })
    await newCredit.save({session})
    await newTransaction.save({session})
    await session.commitTransaction();
    const resultUser = await User.getFromUid(uid);
    res.status(200).json({
      statusCode: 0,
      message: "Success",
      result: resultUser
    })
  } catch(error) {
    session.abortTransaction();
    console.error(error);
    res.status(200).json({
      statusCode: -1,
      message: error,
      result: {}
    })
  } finally { 
    session.endSession();
  }
};

export const purchaseCredit = async (req: Request, res: Response) => {
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
};

export const purchaseProduct = async (req: Request, res: Response) => {
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
      product: productId,
      productType: productType,
      order: order._id,
      createdAt: currentTime,
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
};
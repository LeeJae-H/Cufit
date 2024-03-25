import { Request, Response } from 'express';
import { CustomRequest } from '../types/customRequest';
import * as admin from "firebase-admin";
import { User } from '../models/user.model';
import { Faq } from '../models/faq.model';
import { Follow } from '../models/follow.model';
import { Guideline } from '../models/guideline.model';
import { Filter } from '../models/filter.model';
import { Review } from '../models/review.model';
import { Wish } from '../models/wish.model';
import { Like } from '../models/like.model';
import { Credit, CreditTransaction } from "../models/credit.model";
import mongoose from "mongoose";
const adReward = 1;
import axios from 'axios';
import { Order } from '../models/order.model';
import { Income } from "../models/income.model";
import logger from '../config/logger';

export const login = async (req: Request, res: Response) => {
  const { idToken } = req.body;

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    let userData = await User.getFromUid(uid);
    if (!userData) {
      userData = await User.createNewUser(decodedToken);
    }

    res.status(200).json({
      statusCode: 0,
      message: "Successfully login",
      result: userData
    });
    logger.info('Successfully login');
  } catch (error) {
    res.status(500).json({
      statusCode: -1,
      message: error, // error.message
      result: {}
    });
    logger.error(`Error login: ${error}`);
  }
};

export const getUserProfile = async (req: Request, res: Response) => {
  const uid = req.params.uid;

  try {
    const user = await User.getFromUid(uid);  // 데이터베이스에서 uid 조회
    if (user) {
      res.status(200).json({
        statusCode: 0,
        message: "Success",
        user: user
      });
    } else {
      res.status(400).json({
        statusCode: -1,
        message: "User not found",
        result: {}
      });
    }
    logger.info('Successfully get user profile');
  } catch (error) {
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}    
    });
    logger.error(`Error get user profile: ${error}`);
  }  
};

export const updateUserProfile = async (req: CustomRequest, res: Response) => {
  const uid = req.uid!;  
  const { bio, displayName, instagramName, tiktokName, youtubeName, photoURL } = req.body;
  const newUserData = {
    bio: bio,
    displayName: displayName,
    instagramName: instagramName,
    tiktokName: tiktokName,
    youtubeName: youtubeName,
    photoURL: photoURL
  }

  try {
    const existingUser = await User.findOne({ displayName: displayName });
    if (existingUser && existingUser.uid !== uid) { 
      return res.status(400).json({
        statusCode: -1,
        message: "DisplayName is already existed",
        result: {}
      });
    }

    await User.findOneAndUpdate({ uid: uid }, { $set: newUserData });  // 데이터베이스에서 uid 조회
    const result = await User.getFromUid(uid);
    res.status(200).json({
      statusCode: 0,
      message: "Successfully updated",
      result: result
    });
    logger.info('Successfully update user profile');
  } catch (error) {
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    });
    logger.error(`Error update user profile: ${error}`);
  }
};

export const deleteUser = async (req: CustomRequest, res: Response) => {
  const uid = req.uid!;
  try {
    await admin.auth().deleteUser(uid)
    await User.deleteOne({uid});
    res.status(200).json({
      statusCode: 0,
      message: "Successfully deleted",
      result: {}
    })
    logger.info('Successfully delete user');
  } catch(error) {
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    })
    logger.error(`Error delete user: ${error}`);
  }
};

export const getFollowerList = async (req: Request, res: Response) => {
  const uid = req.params.uid;

  try {
    const followerList = await Follow.getFollowerList(uid);
    res.status(200).json({
      statusCode: 0,
      message: "Success",
      result: followerList
    });
    logger.info('Successfully get follower list');
  } catch (error) {
    res.status(500).json({ 
      statusCode: -1,
      message: error,
      result: {}
     });
     logger.error(`Error get follower list: ${error}`);
  }
};

export const getFollowingList = async (req: Request, res: Response) => {
  const uid = req.params.uid;

  try {
    const followingList = await Follow.getFollowingList(uid);
    res.status(200).json({
      statusCode: 0,
      message: "Success",
      result: followingList
    });
    logger.info('Successfully get following list');
  } catch (error) {
    res.status(500).json({ 
      statusCode: -1,
      message: error,
      result: {}
     });  
     logger.error(`Error get following list: ${error}`);
  }
};

export const getFaqList = async (req: Request, res: Response) => {
  const uid = req.params.uid;

  try {
    const result = await Faq.getFromUid(uid);
    res.status(200).json({
      statusCode: 0,
      message: "Success",
      result: result
    })
    logger.info('Successfully get faq list');
  } catch(error){
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    })
    logger.error(`Error get faq list: ${error}`);
  } 
};

export const getProductList = async (req: Request, res: Response) => {
  const uid = req.params.uid;

  try {
    const filters = await Filter.getListFromCreatorUid(uid);
    const guidelines = await Guideline.getListFromCreatorUid(uid);
    res.status(200).json({
      statusCode: 0,
      message: "Successfully read product list",
      result: {
        filters: filters,
        guidelines: guidelines
      }
    })
    logger.info('Successfully get product list');
  } catch(error) {
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {
        filters: [],
        guidelines: []
      }
    })
    logger.error(`Error get product list: ${error}`);
  }
};

export const getLikeList = async (req: Request, res: Response) => {
  const uid = req.params.uid;

  try {
    const likelistData = await Like.getLikelist(uid);
    res.status(200).json({
      statusCode: 0,
      message: 'Successfully read likelist',
      result:{
        filters: likelistData.filters,
        guidelines: likelistData.guidelines,
      }
    });
    logger.info('Successfully get like list');
  } catch (error) {
    res.status(500).json({
      statusCode: -1,
      message: error,
      result:{
        filters:[],
        guidelines: []
      }
    });
    logger.error(`Error get like list: ${error}`);
  }
};

export const getWishList = async (req: Request, res: Response) => {
  const uid = req.params.uid;

  try {
    const wishlistData = await Wish.getWishlist(uid);
    res.status(200).json({
      statusCode: 0,
      message: 'Successfully read wishlist',
      result:{
        filters: wishlistData.filters,
        guidelines: wishlistData.guidelines,
      }
    });
    logger.info('Successfully get wish list');
  } catch (error) {
    res.status(500).json({
      statusCode: -1,
      message: error,
      result:{
        filters:[],
        guidelines: []
      }
    });
    logger.error(`Error get wish list: ${error}`);
  }
};

export const checkFollow = async (req: Request, res: Response) => {
  const srcUid = req.query.src as string;
  const dstUid = req.query.dst as string;

  try {
    const srcExist = await User.exists({ uid: srcUid });
    const dstExist = await User.exists({ uid: dstUid });
    if (!srcExist) {
      logger.error("User not found for provided source uid");
      return res.status(400).json({
        statusCode: -1,
        message: "User not found for provided source uid",
        result: {}
      });
    }
    if (!dstExist) {
      logger.error("User not found for provided destination uid");
      return res.status(400).json({
        statusCode: -1,
        message: "User not found for provided destination uid",
        result: {}      
      });
    }
    
    const result = await Follow.isFollowed(srcUid, dstUid);
    const followMessage = result ? "Successfully followed" : "Successfully unfollowed";
    const isFollowed = result ? true : false;
    res.status(200).json({
      statusCode: 0,
      message: followMessage,
      result: isFollowed
    });
    logger.info(followMessage);
  } catch(error) {
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    })
    logger.error(`Error check follow: ${error}`);
  }
};

export const toggleFollow = async (req: Request, res: Response) => {
  const { srcUid, dstUid } = req.body;

  try {
    const srcExist = await User.exists({ uid: srcUid });
    const dstExist = await User.exists({ uid: dstUid });
    if (!srcExist) {
      logger.error("User not found for provided source uid");
      return res.status(400).json({
        statusCode: -1,
        message: "User not found for provided source uid",
        result: {}
      });
    }
    if (!dstExist) {
      logger.error("User not found for provided destination uid");
      return res.status(400).json({
        statusCode: -1,
        message: "User not found for provided destination uid",
        result: {}
      });
    }
    
    const result = await Follow.follow(srcUid, dstUid);
    const followMessage = result ? "Successfully followed" : "Successfully unfollowed";
    const isFollowed = result ? true : false;
    res.status(200).json({
      statusCode: 0,
      message: followMessage,
      result: isFollowed,
    });
    logger.info(followMessage);
  } catch(error) {
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    })
    logger.error(`Error toggle follow: ${error}`);
  }
};

export const uploadFaq = async (req: Request, res: Response) => {
  const { uid, title, content, type } = req.body;
  if (!uid || !title || !content || !type) {
    logger.error("Lack of essential data");
    return res.status(400).json({
      statusCode: -1,
      message: "Lack of essential data",
      result: {}
    });
  }

  try {
    const faqData = {
      uid, title, content, faqType: type, createdAt: Date.now()
    }
    const newFaq = new Faq(faqData);
    await newFaq.save();
    res.status(200).json({
      statusCode: 0,
      message: "Successfully upload",
      result: newFaq
    })
    logger.info("Successfully upload faq");
  } catch(error){
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    })
    logger.error(`Error upload faq: ${error}`);
  }
};

export const likeProduct = async (req: Request, res: Response) => {
  const productId = req.body.productId;
  const uid = req.body.uid;
  const type = req.body.type;
  const createdAt = Date.now();
  
  try{
    let isLiked = await Like.isExist(productId, uid, type);
    if (type === "Filter") {
      if(isLiked) {
        await Like.deleteOne({productId: productId, uid: uid, productType: type});
        res.status(200).json({
          statusCode: 0,
          message: "Successfully filter like deleted",
          result: false
        })
        logger.info("Successfully filter like deleted");
      } else {
        const like = new Like({
          productId: productId,
          uid: uid,
          productType: type,
          createdAt: createdAt
        })
        await like.save();
        res.status(200).json({
          statusCode: 0,
          message: "Successfully filter like registed",
          result: true
        })
        logger.info("Successfully filter like registed");
      }
    } else if (type === "Guideline") {
      if(isLiked) {
        await Like.deleteOne({productId: productId, uid: uid, productType: type});
        res.status(200).json({
          statusCode: 0,
          message: "Successfully guideline like deleted",
          result: false
        })
        logger.info("Successfully guideline like deleted");
      } else {
        const like = new Like({
          productId: new mongoose.Types.ObjectId(productId),
          uid: uid,
          productType: type,
          createdAt: createdAt
        })
        await like.save();
        res.status(200).json({
          statusCode: 0,
          message: "Successfully guideline like registed",
          result: true
        })
        logger.info("Successfully guideline like registed");
      }
    } else if (type === "PhotoZone") {
      if(isLiked) {
        await Like.deleteOne({productId: productId, uid: uid, productType: type});
        res.status(200).json({
          statusCode: 0,
          message: "Successfully photoZone like deleted",
          result: false
        })
        logger.info("Successfully photoZone like deleted");
      } else {
        const like = new Like({
          productId: new mongoose.Types.ObjectId(productId),
          uid: uid,
          productType: type,
          createdAt: createdAt
        })
        await like.save();
        res.status(200).json({
          statusCode: 0,
          message: "Successfully photoZone like registed",
          result: true
        })
        logger.info("Successfully photoZone like registed");
      }
    }
  } catch (error) {
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    })
    logger.error(`Error like product: ${error}`);
  }
};

export const wishProduct = async (req: Request, res: Response) => {
  const productId = req.body.productId;
  const uid = req.body.uid;
  const type = req.body.type;
  const createdAt = Date.now();

  try{
    let isWished = await Wish.isExist(productId, uid, type);
    if (type === "Filter") {
      if(isWished) {
        await Wish.deleteOne({productId: productId, uid: uid, productType: type});
        res.status(200).json({
          statusCode: 0,
          message: "Successfully filter wish deleted",
          result: false
        })
        logger.info("Successfully filter wish deleted");
      } else {
        const wish = new Wish({
          productId: productId,
          uid: uid,
          productType: type,
          createdAt: createdAt
        })
        await wish.save();
        res.status(200).json({
          statusCode: 0,
          message: "Successfully filter wish registed",
          result: true
        })
        logger.info("Successfully filter wish registed");
      }
    } else if (type === 'Guideline') {
      if(isWished) {
        await Wish.deleteOne({productId: productId, uid: uid, productType: type});
        res.status(200).json({
          statusCode: 0,
          message: "Successfully guideline wish deleted",
          result: false
        })
        logger.info("Successfully guideline wish deleted");
      } else {
        const wish = new Wish({
          productId: productId,
          uid: uid,
          productType: type,
          createdAt: createdAt
        })
        await wish.save();
        res.status(200).json({
          statusCode: 0,
          message: "Successfully guideline wish registed",
          result: true
        })
        logger.info("Successfully guideline wish registed");
      }
    } else if (type === 'photoZone') {
      if(isWished) {
        await Wish.deleteOne({productId: productId, uid: uid, productType: type});
        res.status(200).json({
          statusCode: 0,
          message: "Successfully photoZone wish deleted",
          result: false
        })
        logger.info("Successfully photoZone wish deleted");
      } else {
        const wish = new Wish({
          productId: productId,
          uid: uid,
          productType: type,
          createdAt: createdAt
        })
        await wish.save();
        res.status(200).json({
          statusCode: 0,
          message: "Successfully photoZone wish registed",
          result: true
        })
        logger.info("Successfully photoZone wish registed");
      }
    }
  } catch (error) {
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    })
    logger.error(`Error wish product: ${error}`);
  }
};

export const buyProduct = async (req: CustomRequest, res: Response) => {
  const uid = req.uid!;  
  const { productId, productType } = req.body;

  try {
    // 이미 구매한 제품인지 확인하는 프로세스
    const existOrder = await Order.findOne({ uid: uid, productId: productId, productType: productType })
    if (existOrder) {
      logger.error('User already purchased this product');
      return res.status(400).json({
        statusCode: -1,
        message: "User already purchased this product",
        result: {
          productId: productId,
          productType: productType,
          uid: uid
        }
      })
    }

    let product: any = {};
    if (productType === "Filter") {
      product = await Filter.getFromObjId(productId);
    } else if (productType === "Guideline") {
      product = await Guideline.getFromObjId(productId);
    }
    if (!product) {
      throw new Error(`${productId} Product not found.`)
    }
    product = product[0];
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
      logger.error('Not enough credits to purchase this product.');
      return res.status(400).json({
        statusCode: -2,
        message: "Not enough credits to purchase this product.",
        result: {
          credits_of: productPrice
        }
      })
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
      throw error;
    } finally {
      session.endSession();
    }
    
    const user = await User.getFromUid(uid);
    res.status(200).json({
      statusCode: 0,
      message: "Successfully purchase product",
      result: {
        user: user,
        productId: productId,
        productPrice: product.credit,
        productType: productType,
        purchasedAt: currentTime,
        orderId: orderId
      }
    })
    logger.info("Successfully purchase product");
  } catch (error) {
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    })
    logger.error(`Error buy product: ${error}`);
  }
};

export const reviewProduct = async (req: CustomRequest, res: Response) => {
  const productId = req.body.productId;
  const uid = req.uid!;  
  const productType = req.body.productType;
  const stars = req.body.stars;
  const comment = req.body.comment;
  const imageUrl = req.body.imageUrl;

  try {
    const currentTime = Date.now();
    const existReview = await Review.findOne({ uid, productId });
    if (existReview) {
      throw new Error("Review already submitted")
    }

    const review = new Review({
      uid: uid,
      imageUrl: imageUrl,
      stars: stars,
      productId: new mongoose.Types.ObjectId(productId),
      productType: productType,
      comment: comment,
      createdAt: currentTime
    })
    const creditInfo = {
      uid: uid,
      amount: 1,
      createdAt: currentTime,
      expireAt: -1,
      creditType: "REVIEW"
    };
    const newCredit = new Credit(creditInfo)
    const newTransaction = new CreditTransaction({
      creditId: newCredit._id,
      amount: 1,
      createdAt: currentTime,
      transactionType: "REVIEW_REWARD"
    })

    const session = await mongoose.startSession();
    session.startTransaction();
    try{
      await review.save({session});
      await newCredit.save({session})
      await newTransaction.save({session})
      session.commitTransaction();
      const resultUser = await User.getFromUid(uid);
      res.status(200).json({
        statusCode: 0,
        message: "Successfully review saved",
        result: {
          user: resultUser,
          review: review
        }
      })
      logger.info("Successfully review product");
    } catch(error) {
      session.abortTransaction();
      throw new Error("Failed transaction");
    } finally {
      session.endSession();
    }
  } catch (error){
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    })
    logger.error(`Error review product: ${error}`);
  }
};

export const getCreditTransaction = async (req: CustomRequest, res: Response) => {
  const uid = req.uid!;  

  try {
    const credits = await Credit.find({uid: uid})
    const transactions = await CreditTransaction.find({creditId: { $in: credits.map(credit => credit._id)}})
    res.status(200).json({
      statusCode: 0,
      message: "Successfully updated",
      result: transactions
    });
    logger.info("Successfully get credit transaction");
  } catch(error) {
    res.status(500).json({ 
      statusCode: -1,
      message: error,
      result: {}
     }); 
     logger.error(`Error get credit transaction: ${error}`);
  }
};

export const getAdrewardAmount = async (req: Request, res: Response) => {
  res.status(200).json({
    statusCode: 0,
    message: "Success",
    result: adReward
  })
  logger.info("Successfully get adreward amount");
};

export const getAdreward = async (req: CustomRequest, res: Response) => {
  const uid = req.uid!;  
  const session = await mongoose.startSession();
  try {
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
    logger.info("Successfully get adreward");
  } catch(error) {
    session.abortTransaction();
    res.status(200).json({
      statusCode: -1,
      message: error,
      result: {}
    })
    logger.error(`Error get adreward: ${error}`);
  } finally { 
    session.endSession();
  }
};

export const purchaseCredit = async (req: Request, res: Response) => {
  const { uid, atid, receiptData } = req.body;

  try {
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
          logger.error("This transaction already created.")
          return res.status(400).json({
            statusCode: -1,
            message: "This transaction already created.",
            result: {}
          });
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
        res.status(200).json({ 
          statusCode: 0,
          message: 'Successfully credit purchase verified and saved', 
          result: {
            newCredit: newCredit, 
            newTransaction: newTransaction 
          }
        });
        logger.info("Successfully purchase credit")
      } catch(error) {
        await session.abortTransaction();
        throw error
      } finally {
        session.endSession();
      }

    } else if (verificationResult.status === 21007) { // Sandbox용 결제인 경우 Sandbox URL로 재검증 요청
      const existOrder = await Credit.find({ uid: uid, atid: atid });
      if (existOrder.length > 0) {
        logger.error("This transaction already created.");
        return res.status(400).json({
          statusCode: -1,
          message: "This transaction already created.",
          result: {}
        });
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
          res.status(200).json({ 
            statusCode: 0,
            message: 'Successfully credit purchase verified and saved', 
            result: {
              newCredit: newCredit, 
              newTransaction: newTransaction 
            }
          });
          logger.info("Successfully purchase credit")
        } catch(error) {
          await session.abortTransaction();
          throw new Error("Failed transaction")
        } finally {
          session.endSession();
        }
      } else {
        res.status(400).json({ 
          statusCode: -1,
          message: 'Invalid receipt even in Sandbox', 
          result: {
            sandboxVerificationResult: sandboxVerificationResult 
          }
        });
        logger.error("Invalid receipt even in Sandbox");
      }
    } else {
      res.status(400).json({ 
        statusCode: -1,
        message: 'Invalid receipt', 
        result: {
          verificationResult: verificationResult 
        }
      });
      logger.error("Invalid receipt");
    }
  } catch (error) {
    res.status(500).json({ 
      statusCode: -1,
      message: error, 
      result: {}
    });
    logger.error(`Error purchase credit: ${error}`);
  }
};

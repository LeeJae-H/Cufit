import { Request, Response } from 'express';
import { Double } from 'aws-sdk/clients/apigateway';
import { User } from '../models/user.model';
import { Guideline } from '../models/guideline.model';
import { Filter } from '../models/filter.model';
import { Review } from '../models/review.model';
import { Like } from '../models/like.model';
import { Wish } from '../models/wish.model';
import { Follow } from '../models/follow.model';
import { Order } from '../models/order.model';
import { Credit, CreditTransaction } from '../models/credit.model';
import * as admin from "firebase-admin";
import mongoose from "mongoose";

export const getDetail = async (req: Request, res: Response) => {
  const uid = `${req.query.uid}`;
  const cid = `${req.query.cid}`;
  const type = `${req.query.type}`;
  const productId = req.params.productId;
  let avgRating: Double = 0;
  let reviewCount = 0;
  let latestReviews: any[] = [];
  if (!cid || !productId || !type) {
    res.status(401).json({
      error: "no essential data."
    })
    return
  }
  let user: any;
  try {
    const tUser = await User.getFromUid(cid);
    const salingFilters = await Filter.getListFromCreatorUid(tUser.uid);
    const salingGuidelines = await Guideline.getListFromCreatorUid(tUser.uid);
    const reviews = await Review.find({productId: productId}).populate('user');
    let totalRating = 0;
    reviews.forEach(review => totalRating = totalRating + review.stars);
    if (reviews.length > 0) {
      avgRating = totalRating / reviews.length;
    }
    reviewCount = reviews.length;
    latestReviews = reviews.splice(0, 5);
    user = tUser;
    user.salingFilters = salingFilters;
    user.salingGuidelines = salingGuidelines;
  } catch(error) {
    console.error("error while find creator info.")
    console.error(error);
    res.status(400).json({
      error: error
    })
  }
  
  if (!uid || uid === "") {
    res.status(200).json({
      statusCode: 0,
      message: "Success",
      result: {
        creator: user,
        isFollowed: false,
        isLiked: false,
        isWished: false,
        isPurchased: false,
        rating: avgRating,
        reviewCount,
        latestReviews: latestReviews
      }
    })
    return
  }
  let isFollowed: Boolean = await Follow.isFollowed(uid, cid);
  let isLiked: Boolean = await Like.isExist(productId, uid, type);
  let isWished: Boolean = await Wish.isExist(productId, uid, type);
  let isPurchased: Boolean = await Order.isExist(productId, uid, type);
  let review = await Review.findOne({uid, productId});
  
  res.status(200).json({
    statusCode: 0,
    message: "Success",
    result: {
      creator: user,
      isFollowed,
      isLiked,
      isWished,
      isPurchased,
      review,
      rating: avgRating,
      reviewCount,
      latestReviews: latestReviews
    }
  })
};

export const getReview = async (req: Request, res: Response) => {
  const productId = req.params.productId;
  const reviews = await Review.find({ productId })
                    .populate('user');
  res.status(200).json({
    statusCode: 0,
    message: "Success",
    result: reviews
  })
};

export const writeReview = async (req: Request, res: Response) => {
  const productId = req.params.productId;
  const idToken = req.body.idToken;
  const productType = req.body.productType;
  const stars = req.body.stars;
  const comment = req.body.comment;
  const imageUrl = req.body.imageUrl;

  const session = await mongoose.startSession();
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const currentTime = Date.now();
    session.startTransaction();
    const existReview = await Review.findOne({ uid, productId });
    if (existReview) {
      console.log(existReview);
      res.status(200).json({
        statusCode: 1,
        message: "Review already submitted.",
        result: existReview
      })
      return
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
    await review.save({session});
    await newCredit.save({session})
    await newTransaction.save({session})
    session.commitTransaction();
    const resultUser = await User.getFromUid(uid);
    res.status(200).json({
      statusCode: 0,
      message: "Review saved.",
      result: {
        user: resultUser,
        review
      }
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

export const like = async (req: Request, res: Response) => {
  const productId = req.body.productId;
  const uid = req.body.uid;
  const type = req.body.type;
  const createdAt = Date.now();
  let isLiked = await Like.isExist(productId, uid, type);
  if (type === "Filter") {
    if(isLiked) {
      await Like.deleteOne({productId: productId, uid: uid, productType: type});
      res.status(200).json({
        result: false
      })
      return
    } else {
      const like = new Like({
        productId: productId,
        uid: uid,
        productType: type,
        createdAt: createdAt
      })
      await like.save();
      res.status(200).json({
        result: true
      })
      return
    }
  } else if (type === "Guideline") {
    if(isLiked) {
      await Like.deleteOne({productId: productId, uid: uid, productType: type});
      res.status(200).json({
        result: false
      })
      return
    } else {
      const like = new Like({
        productId: new mongoose.Types.ObjectId(productId),
        uid: uid,
        productType: type,
        createdAt: createdAt
      })
      await like.save();
      res.status(200).json({
        result: true
      })
      return
    }
  } else {
    res.status(201).json({
      message: "type needed"
    })
    return;
  }
};

export const wish = async (req: Request, res: Response) => {
  const productId = req.body.productId;
  const uid = req.body.uid;
  const type = req.body.type;
  const createdAt = Date.now();
  let isWished = await Wish.isExist(productId, uid, type);
  if (type === "Filter") {
    if(isWished) {
      await Wish.deleteOne({productId: productId, uid: uid, productType: type});
      res.status(200).json({
        result: false
      })
      return
    } else {
      const wish = new Wish({
        productId: productId,
        uid: uid,
        productType: type,
        createdAt: createdAt
      })
      await wish.save();
      res.status(200).json({
        result: true
      })
      return
    }
  } else if (type === 'Guideline') {
    if(isWished) {
      await Wish.deleteOne({productId: productId, uid: uid, productType: type});
      res.status(200).json({
        result: false
      })
      return
    } else {
      const wish = new Wish({
        productId: productId,
        uid: uid,
        productType: type,
        createdAt: createdAt
      })
      await wish.save();
      res.status(200).json({
        result: true
      })
      return
    }
  } else {
    res.status(201).json({
      message: "type needed"
    })
    return;
  }
};

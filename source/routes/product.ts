import express from 'express';
import mongoose from 'mongoose';
import { User } from '../models/user';
import { Follow } from '../models/follow';
import { Like } from '../models/like';
import { Wish } from '../models/wish';
import { Order } from '../models/order';
import { Filter } from '../models/filter';
import { Guideline } from '../models/guideline';
import { Review } from '../models/review';
import * as admin from "firebase-admin";
// router 객체
const router = express.Router();

router.post('/like', async (req, res) => {
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
})

router.post('/wish', async (req, res) => {
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
})

router.post("/review/:productId", async (req, res) => {
  const productId = req.params.productId;
  const idToken = req.body.idToken;
  const productType = req.body.productType;
  const stars = req.body.stars;
  const comment = req.body.comment;
  const imageUrl = req.body.imageUrl;

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    console.log(uid);
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
      createdAt: Date.now()
    })
    await review.save();
    console.log(review);
    res.status(200).json({
      statusCode: 0,
      message: "Review saved.",
      result: review
    })
  } catch(error) {
    console.error(error);
    res.status(200).json({
      statusCode: -1,
      message: error,
      result: {}
    })
  }
})

router.get("/detail/:productId", async (req, res) => {
  const uid = `${req.query.uid}`;
  const cid = `${req.query.cid}`;
  const type = `${req.query.type}`;
  const productId = req.params.productId;
  if (!cid || !productId || !type) {
    res.status(401).json({
      error: "no essential data."
    })
    return
  }
  let user: any;
  try {
    const tUser = await User.getFromUid(cid);
    const salingFilters = await Filter.getListFromCreatorUid(tUser.uid, "authorized");
    const salingGuidelines = await Guideline.getListFromCreatorUid(tUser.uid, "authorized");
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
      creator: user,
      isFollowed: false,
      isLiked: false,
      isWished: false,
      isPurchased: false
    })
    return
  }
  let isFollowed: Boolean = await Follow.isFollowed(uid, cid);
  let isLiked: Boolean = await Like.isExist(productId, uid, type);
  let isWished: Boolean = await Wish.isExist(productId, uid, type);
  let isPurchased: Boolean = await Order.isExist(productId, uid, type);
  let review = await Review.find({uid, productId});
  
  res.status(200).json({
    creator: user,
    isFollowed,
    isLiked,
    isWished,
    isPurchased,
    review
  })
})

export default router;
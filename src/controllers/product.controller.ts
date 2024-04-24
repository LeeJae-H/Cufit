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
import logger from '../config/logger';
import { ViewCount } from '../models/viewCount.model';

export const getDetail = async (req: Request, res: Response) => {
  const uid = `${req.query.uid}`;
  const cid = `${req.query.cid}`;
  const type = `${req.query.type}`;
  const productId = req.params.productId;
  let avgRating: Double = 0;
  let reviewCount = 0;
  let latestReviews: any[] = [];
  if (!productId || !type) {
    logger.error("Lack of essential data");
    return res.status(400).json({
      statusCode: -1,
      message: "Lack of essential data",
      result: {}
    })
  }

  try{
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
      throw new Error("error while find creator info");
    }
    
    const view = new ViewCount({
      productId: productId,
      productType: type,
      uid: uid,
      createdAt: Date.now()
    });
    
    view.save(); // 저장보다 정보를 가져오는게 더중요하고 저장이 안되어도 크게 문제가 되지 않기 때문에 결과를 보지 않고 다음 블록을 진행하도록 await 제거

    if (!uid || uid === "") {
      return res.status(200).json({
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
      });
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
    logger.info("Successfully get detail");
  } catch (error) {
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    })
    logger.error(`Error get detail: ${error}`);
  }
};

export const getReview = async (req: Request, res: Response) => {
  const productId = req.params.productId;
  
  try{
    const reviews = await Review.find({ productId }).populate('user');
    res.status(200).json({
      statusCode: 0,
      message: "Success",
      result: reviews
    })
    logger.info("Successfully get review");
  } catch (error) {
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    })
    logger.error(`Error get review: ${error}`);
  }
};


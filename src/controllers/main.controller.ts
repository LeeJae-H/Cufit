import { Request, Response } from 'express';
import logger from '../config/logger';
import { PopularTag } from '../models/popularTag.model';
import { TodayPhotoZone } from '../models/todayPhotoZone.model';
import { TodayGuideline } from '../models/todayGuideline.model';
import { Guideline } from '../models/guideline.model';
import { PhotoZone } from '../models/photoZone.model';
import { TrendingPose } from '../models/tredingPose.model';

export const getTodayGuideline = async (req: Request, res: Response) => {
  try{
    const guideline = await TodayGuideline.findOne().sort({ _id: -1 }); // 가장 최근에 등록된 가이드라인 하나를 가져와야함
    // 또한 그 결과에는 가이드라인 정보가 포함되어있어야함
    const guidelineId = guideline?.productId;
    const product: any = await Guideline.getFromObjId(String(guidelineId));

    const result: any = {
      _id: guideline?._id,
      title: guideline?.title,
      createdAt: guideline?.createdAt,
      guideline: product[0],
      description: guideline?.description,
      imageUrl: guideline?.imageUrl
    }

    res.status(200).json({
      statusCode: 0,
      message: "Success",
      result: result
    })
    logger.info("Successfully get guidelines");
  } catch(error){
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    })
    logger.error(`Error get guidelines: ${error}`);
  }
};

export const getTodayPhotozone = async (req: Request, res: Response) => {
  try{
    const photozone = await TodayPhotoZone.findOne().sort({ _id: -1 });
    // 마찬가지로 포토존 정보가 포함되어있어야함.
    const photozoneId = photozone?.productId;
    const product: any = await PhotoZone.getFromObjId(String(photozoneId));
    
    const result: any = {
      _id: photozone?._id,
      title: photozone?.title,
      createdAt: photozone?.createdAt,
      photozone: product[0],
      description: photozone?.description,
      imageUrl: photozone?.imageUrl
    }

    res.status(200).json({
      statusCode: 0,
      message: "Success",
      result: result
    })
    logger.info("Successfully get today's photozone");
  } catch(error){
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    })
    logger.error(`Error get today's photozone: ${error}`);
  }
};

export const getTagList = async (req: Request, res: Response) => {
  try{
    const tags = await PopularTag.find({ present: true });
    res.status(200).json({
      statusCode: 0,
      message: "Success",
      result: tags
    })
    logger.info("Successfully get tags");
  } catch(error){
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    })
    logger.error(`Error get tags: ${error}`);
  }
}

export const getTrendingPoseList = async (req: Request, res: Response) => {
  try{
    const tagList = await TrendingPose.getList();
    res.status(200).json({
      statusCode: 0,
      message: "Success",
      result: tagList
    })
    logger.info("Successfully get tag-list");
  } catch(error){
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    })
    logger.error(`Error get tag-list: ${error}`);
  }
};

export const getPopularGuidelines = async(req: Request, res: Response) => {
  try{
    const result = await Guideline.getPopular();
    res.status(200).json({
      statusCode: 0,
      message: "Success",
      result
    })
    logger.info("Successfully get popular guidelines");
  } catch(error){
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    })
    logger.error(`Error get popular guidelines: ${error}`);
  }
}

export const getPopularPhotozones = async(req: Request, res: Response) => {
  try{
    const result = await PhotoZone.getPopular();
    res.status(200).json({
      statusCode: 0,
      message: "Success",
      result
    })
    logger.info("Successfully get popular photozones");
  } catch(error){
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    })
    logger.error(`Error get popular photozones: ${error}`);
  }
}
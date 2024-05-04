import { Request, Response } from 'express';
import logger from '../config/logger';
import { PopularTag } from '../models/popularTag.model';
import { TodayPhotoZone } from '../models/todayPhotoZone.model';
import { TodayGuideline } from '../models/todayGuideline.model';

export const getTodayGuideline = async (req: Request, res: Response) => {
  try{
    const guideline = await TodayGuideline.find(); // 가장 최근에 등록된 가이드라인 하나를 가져와야함
    // 또한 그 결과에는 가이드라인 정보가 포함되어있어야함
    res.status(200).json({
      statusCode: 0,
      message: "Success",
      result: guideline
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
    const photozone = await TodayPhotoZone.find();
    // 마찬가지로 포토존 정보가 포함되어있어야함.
    res.status(200).json({
      statusCode: 0,
      message: "Success",
      result: photozone
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
    const tags = await PopularTag.find();
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

export const getPopularGuidelines = async(req: Request, res: Response) => {
  // 추후에 추가합시다.
}
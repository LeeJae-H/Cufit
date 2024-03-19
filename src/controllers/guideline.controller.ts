import { Request, Response } from 'express';
import { Guideline } from '../models/guideline.model';
import { Contents } from '../models/contents.model';
import { Auth } from '../models/auth.model';
import mongoose from 'mongoose';
import logger from '../config/logger';
import { CustomRequest } from '../types/customRequest';

export const uploadGuideline = async (req: Request, res: Response) => {
  const {
    title,
    shortDescription,
    description,
    credit,
    creatorUid,
    originalImageUrl,
    guidelineImageUrl,
    placeName, // nullable
  } = req.body;
  const tagsString = req.body.tags;
  const locationString = req.body.location;
  const createdAt = Date.now();
  if (!title || !tagsString || ! shortDescription || !description || !credit || !creatorUid || !originalImageUrl || ! guidelineImageUrl) {
    logger.error("Lack of essential data");
    return res.status(400).json({
      statusCode: -1,
      message: "Lack of essential data",
      result: {}
    });
  }

  try{
    let location: any = {};
    if (locationString) {
      try{
        location = JSON.parse(locationString);
      } catch (error){
        throw new Error("Error while parsing location");
      }
    } else {
      location = {
        type: "Point",
        coordinates: [0, 0]
      }
    }
    const newGuideline = new Guideline({
      title: title,
      type: "Guideline",
      createdAt: createdAt,
      credit: parseInt(credit),
      tags: tagsString.split(','),
      shortDescription,
      description,
      creatorUid,
      originalImageUrl: originalImageUrl,
      guidelineImageUrl: guidelineImageUrl,
      placeName: placeName,
      location: location
    })
    const newAuthStatus = new Auth({
      productId: newGuideline._id,
      productType: 'Guideline',
      code: 'unauthorized',
      message: 'In process...',
      createdAt: createdAt,
      lastAt: createdAt
    })
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      const result = await newGuideline.save({ session });
      await newAuthStatus.save({ session });
      await session.commitTransaction();
      res.status(200).json({
        statusCode: 0,
        message: "Successfully uploaded", 
        result: result
      });
      logger.info("Successfully upload guideline");
    } catch(error) {
      await session.abortTransaction();
      throw new Error("Failed transaction");
    } finally {
      session.endSession();
    }
  } catch (error) {
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    })
    logger.error(`Error upload guideline: ${error}`);
  }
};

export const getGuidelineTop5 = async (req: CustomRequest, res: Response) => {
  try{
    const authCode: any = req.query.code;
    const contents = await Contents.getGuidelineContents();
    const list: any[] = contents?.list ?? []
    let result = []
    for(var item of list) {
      const tag = item.t;
      const sortBy = item.b;
      const sort = item.s;
      const filters = await Guideline.getListFromTagWithSort(tag, sortBy, sort);
      const data = {
        title: item.d,
        tag: tag,
        list: filters
      }
      result.push(data);
    }
    let top = await Guideline.top5(authCode);
    res.status(200).json({
      statusCode: 0,
      message: "Successfully read main contents",
      result: {
        top: top,
        contents: result
      }
    })
    logger.info("Successfully get guideline main");
  } catch (error) {
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    })
    logger.error(`Error get guideline main: ${error}`);
  }
};

export const getGuidelineById = async (req: CustomRequest, res: Response) => {
  const _id = req.params.id;
  const authCode: any = req.query.code;
  try {
    const result = await Guideline.getFromObjId(_id, authCode);
    res.status(200).json({
      statusCode: 0,
      message: "Success",
      result: result
    });
    logger.info("Successfully get guideline by id");
  } catch(error) {
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    })
    logger.error(`Error get guideline by id: ${error}`);
  }
};

export const getGuidelineByUid = async (req: CustomRequest, res: Response) => {
  const uid = req.params.uid;
  const authCode: any = req.query.code;

  try {
    const result = await Guideline.getListFromCreatorUid(uid, authCode);
    res.status(200).json({
      statusCode: 0,
      message: "Success",
      result: result
    });
    logger.info("Successfully get guideline by uid");
  } catch(error) {
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    })
    logger.error(`Error get guideline by uid: ${error}`);
  }
};

export const getGuidelineByKeyword = async (req: Request, res: Response) => {
  const keyword = req.params.keyword.toLowerCase();
  const sort = `${req.query.sort}`;
  const sortby = `${req.query.sortby}`;
  const cost = `${req.query.cost}`;
  if (!keyword || !sort || !sortby || !cost) {
    logger.error("Lack of essential data");
    return res.status(400).json({
      statusCode: -1,
      message: "Lack of essential data",
      result: {}
    })
  }
  
  try{
    const result = await Guideline.search(keyword, sort, sortby, cost);
    res.status(200).json({
      statusCode: 0,
      message: "Success",
      result: result
    })
    logger.info("Successfully get guideline by keyword");
  } catch (error) {
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    })
    logger.error(`Error get guideline by keyword: ${error}`);
  }
};

export const getGuidelineByDistance = async (req: CustomRequest, res: Response) => {
  const authCode: any = req.query.code;
  if (!req.query.lat || !req.query.lng) {
    logger.error("Lack of essential data");
    return res.status(400).json({
      statusCode: -1,
      message: "Lack of essential data",
      result: {}
    })
  }
  
  try{
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const distanceString = req.query.distance === undefined ? "1000" : `${req.query.distance}`
    const distance = parseFloat(distanceString);
    const result = await Guideline.findByDistance(lat, lng, distance, authCode);
    res.status(200).json({
      statusCode: 0,
      message: "Success",
      result: result
    })
    logger.info("Successfully get guideline by distance");
  } catch (error) {
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    })
    logger.error(`Error get guideline by distance: ${error}`);
  }
};

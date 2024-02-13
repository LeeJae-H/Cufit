import { Request, Response } from 'express';
import { Guideline } from '../models/guideline.model';
import { Contents } from '../models/contents.model';
import { Auth } from '../models/auth.model';
import mongoose from 'mongoose';

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
  }
};

export const getGuidelineTop5 = async (req: Request, res: Response) => {
  try{
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
    let top = await Guideline.top5();
    res.status(200).json({
      statusCode: 0,
      message: "Successfully read main contents",
      result: {
        top: top,
        contents: result
      }
    })
  } catch (error) {
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    })
  }
};

export const getGuidelineById = async (req: Request, res: Response) => {
  const _id = req.params.id;

  try {
    const result = await Guideline.getFromObjId(_id);
    res.status(200).json({
      statusCode: 0,
      message: "Success",
      result: result
    });
  } catch(error) {
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    })
  }
};

export const getGuidelineByUid = async (req: Request, res: Response) => {
  const uid = req.params.uid;

  try {
    const result = await Guideline.getListFromCreatorUid(uid);
    res.status(200).json({
      statusCode: 0,
      message: "Success",
      result: result
    });
  } catch(error) {
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    })
  }
};

export const getGuidelineByKeyword = async (req: Request, res: Response) => {
  const keyword = req.params.keyword.toLowerCase();
  const sort = `${req.query.sort}`;
  const sortby = `${req.query.sortby}`;
  const cost = `${req.query.cost}`;
  if (!keyword || !sort || !sortby || !cost) {
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
  } catch (error) {
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    })
  }
};

export const getGuidelineByDistance = async (req: Request, res: Response) => {
  if (!req.query.lat || !req.query.lng) {
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
    const result = await Guideline.findByDistance(lat, lng, distance);
    res.status(200).json({
      statusCode: 0,
      message: "Success",
      result: result
    })
  } catch (error) {
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    })
  }
};

import { Request, Response } from 'express';
import { Filter } from '../models/filter.model';
import { Contents } from '../models/contents.model';
import { Auth } from '../models/auth.model';
import mongoose from 'mongoose';

export const uploadFilter = async (req: Request, res: Response) => {
  const {
    title,
    shortDescription,
    description,
    credit,
    creatorUid,
    adjustment,
    originalImageUrl,
    filteredImageUrl,
  } = req.body;
  const createdAt = Date.now();
  const tagsString = req.body.tags;
  if (!title || !tagsString || ! shortDescription || !description || !credit || !creatorUid || !adjustment || !originalImageUrl || ! filteredImageUrl) {
    return res.status(400).json({
      statusCode: -1,
      message: "Lack of essential data",
      result: {}
    })
  }

  try {
    let adjustmentObject;
    try {
      adjustmentObject = JSON.parse(adjustment);
    } catch(error) {
      throw new Error("Error while parsing adjustment");
    }
    const newFilter = new Filter({
      title: title,
      type: "Filter",
      createdAt: createdAt,
      credit: parseInt(credit),
      tags: tagsString.split(','),
      shortDescription,
      description,
      creatorUid,
      adjustment: adjustmentObject,
      originalImageUrl: originalImageUrl,
      filteredImageUrl: filteredImageUrl
    })
    const newAuthStatus = new Auth({
      productId: newFilter._id,
      productType: 'Filter',
      code: 'unauthorized',
      message: 'In process....',
      createdAt: createdAt,
      lastAt: createdAt
    })
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      const result = await newFilter.save({ session });
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
  } catch (error){
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    })
  }
};

export const getFilterTop5 = async (req: Request, res: Response) => {
  try{
    const contents = await Contents.getFilterContents();
    const list: any[] = contents?.list ?? []
    let result = []
    for(var item of list) {
      const tag = item.t;
      const sortBy = item.b;
      const sort = item.s;
      const filters = await Filter.getListFromTagWithSort(tag, sortBy, sort);
      const data = {
        title: item.d,
        tag: tag,
        list: filters
      }
      result.push(data);
    }
    let top = await Filter.top5();
    res.status(200).json({
      statusCode: 0,
      message: "Successfully read main contents",
      result: {
        top: top,
        contents: result
      }
    })
  } catch (error){
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    })
  }
};

export const getFilterById = async (req: Request, res: Response) => {
  const _id = req.params.id;
  
  try {
    const result = await Filter.getFromObjId(_id);
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

export const getFilterByUid = async (req: Request, res: Response) => {
  const uid = req.params.uid;

  try {
    const result = await Filter.getListFromCreatorUid(uid);
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

export const getFilterByKeyword = async (req: Request, res: Response) => {
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
    const result = await Filter.search(keyword, sort, sortby, cost);
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
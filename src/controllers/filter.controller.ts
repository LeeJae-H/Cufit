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
    res.status(400).json({
      error: "essential data not found."
    })
    return;
  }
  console.log(adjustment);
  let adjustmentObject;
  try {
    adjustmentObject = JSON.parse(adjustment);
  } catch(error) {
    console.error("error while parsing adjustment.")
    console.error(error);
    res.status(400).json({
      error: error
    })
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
    res.json({
      statusCode: 0,
      message: "successfully uploaded!", 
      result
    });
  } catch(error) {
    await session.abortTransaction();
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

export const getFilterTop5 = async (req: Request, res: Response) => {
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
    message: "Successfully read main contents.",
    top: top,
    contents: result
  })
};

export const getFilterById = async (req: Request, res: Response) => {
  const _id = req.params.id;
  try {
    const result = await Filter.getFromObjId(_id);
    res.status(200).json({
      result
    });
  } catch(error) {
    console.error("error in find by _id.")
    console.error(error);
    res.status(401).json({
      error: error
    })
  }
};

export const getFilterByCreatorId = async (req: Request, res: Response) => {
  const cid = req.params.cid;
  try {
    const result = await Filter.getListFromCreatorId(cid);
    res.status(200).json({
      result
    });
  } catch(error) {
    console.error("error in find by uid.")
    console.error(error);
    res.status(401).json({
      error: error
    })
  }
};

export const getFilterByUid = async (req: Request, res: Response) => {
  const uid = req.params.uid;
  try {
    const result = await Filter.getListFromCreatorUid(uid);
    res.status(200).json({
      result
    });
  } catch(error) {
    console.error("error in find by uid.")
    console.error(error);
    res.status(401).json({
      error: error
    })
  }
};

export const getFilterByKeyword = async (req: Request, res: Response) => {
  const keyword = req.params.keyword.toLowerCase();
  const sort = `${req.query.sort}`;
  const sortby = `${req.query.sortby}`;
  const cost = `${req.query.cost}`;
  if (!keyword || !sort || !sortby || !cost) {
    res.status(201).json({
      message: "essential data not found"
    })
    return;
  }
  const result = await Filter.search(keyword, sort, sortby, cost);
  res.status(200).json({
    result
  })
};
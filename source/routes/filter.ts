import express from 'express';
import { Filter } from '../models/filter';
import { Contents } from '../models/contents';
import { Auth } from '../models/auth';
import mongoose from 'mongoose';
const router = express.Router();

router.post('/upload', async (req, res) => {
  const title = req.body.title;
  const createdAt = Date.now();
  const tagsString = req.body.tags;
  const shortDescription = req.body.shortDescription;
  const description = req.body.description;
  const credit = req.body.credit;
  const creatorUid = req.body.creatorUid;
  const adjustment = req.body.adjustment;
  const originalImageUrl = req.body.originalImageUrl;
  const filteredImageUrl = req.body.filteredImageUrl;
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
    status: 'unauthorized',
    message: 'In process....',
    createdAt: createdAt,
    lastAt: createdAt
  })
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const result = await newFilter.save();
    await newAuthStatus.save();
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
});

router.get("/main", async (req, res) => {
  const contents = await Contents.findOne({ type : "Filter" }).sort({ _id : -1 })
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
})

router.get("/:id", async (req, res) => { // get _id filter
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
})

router.get("/cid/:cid", async (req, res) => { // get filters from user id
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
})

router.get("/uid/:uid", async (req, res) => { // get filters from user id
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
})

router.get("/search/:keyword", async (req, res) => {
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
})

export default router;

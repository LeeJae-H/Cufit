import express from 'express';
import { Filter } from '../models/filter';
import { Contents } from '../models/contents';
const router = express.Router();

// authorization
const auth = {
  UNAUTHORIZED: "unauthorized",
  DENIED: "denied",
  AUTHORIZED: "authorized"
};

router.post('/upload', async (req, res) => {
  const title = req.body.title;
  const createdAt = Date.now();
  const tagsString = req.body.tags;
  const authStatus = auth.UNAUTHORIZED;
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
    authStatus,
    creatorUid,
    adjustment: adjustmentObject,
    originalImageUrl: originalImageUrl,
    filteredImageUrl: filteredImageUrl
  })
  try {
    const result = await newFilter.save();
    res.json({message: "successfully uploaded!", result});
  } catch(error) {
    res.status(401).json({
      error: error,
      message: "error occured while saving to mongodb."
    })
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
    const filters = await Filter.getListFromTagWithSort(tag, sortBy, sort, auth.AUTHORIZED);
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

router.get("/", async (req, res) => { // get all
  const count = parseInt(`${req.query.count}`) ?? 50;
  const authStatus = `${req.query.authStatus}` ?? auth.AUTHORIZED;
  try {
    const result = await Filter.find({ authStatus: authStatus }).sort({ _id: -1 }).limit(count);
    res.status(200).json({
      result
    })
  } catch(error) {
    console.error("error in find all.");
    console.error(error);
    res.status(401).json({
      error: error
    });
  }
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
  const authStatus = `${req.query.authStatus}` ?? auth.AUTHORIZED;
  try {
    const result = await Filter.getListFromCreatorId(cid, authStatus);
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
    const result = await Filter.getListFromCreatorUid(uid, auth.AUTHORIZED);
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

router.get("/tag/:tag", async (req, res) => { // get tagged filters
  const tag = req.params.tag.toLowerCase();
  const authStatus = `${req.query.authStatus}` ?? auth.AUTHORIZED;
  try {
    const result = await Filter.getListFromTag(tag, authStatus);
    res.status(200).json({
      result
    });
  } catch(error) {
    console.error("error in find by tag.")
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

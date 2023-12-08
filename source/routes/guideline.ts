import express from "express";
import { Guideline } from "../models/guideline";
import { Contents } from "../models/contents";

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
  const originalImageUrl = req.body.originalImageUrl;
  const guidelineImageUrl = req.body.guidelineImageUrl;
  const placeName = req.body.placeName; // nullable
  const locationString = req.body.location;
  if (!title || !tagsString || ! shortDescription || !description || !credit || !creatorUid || !originalImageUrl || ! guidelineImageUrl) {
    res.status(400).json({
      error: "essential data not found."
    })
    return;
  }
  let location: any = {};
  if (locationString) {
    location = JSON.parse(locationString);
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
    authStatus,
    creatorUid,
    originalImageUrl: originalImageUrl,
    guidelineImageUrl: guidelineImageUrl,
    placeName: placeName,
    location: location
  })
  try {
    const result = await newGuideline.save();
    res.json({message: "successfully uploaded!", result});
  } catch(error) {
    res.status(401).json({
      error: error,
      message: "error occured while saving to mongodb."
    })
  }
});

router.get("/near", async (req, res) => {
  if (!req.query.lat || !req.query.lng) {
    res.status(201).json({
      message: "lat or lng not found."
    })
  }
  const lat = parseFloat(req.query.lat as string);
  const lng = parseFloat(req.query.lng as string);
  const distanceString = req.query.distance === undefined ? "1000" : `${req.query.distance}`
  const distance = parseFloat(distanceString);
  const result = await Guideline.find({
    location: {
     $near: {
      $maxDistance: distance,
      $geometry: {
       type: "Point",
       coordinates: [lng, lat]
      }
     }
    }
   })
   res.status(200).json({
    result
   })
})


router.get("/", async (req, res) => { // get all
  const count = parseInt(`${req.query.count}`) ?? 50;
  const authStatus = `${req.query.authStatus}` ?? auth.AUTHORIZED;
  try {
    const result = await Guideline.find({ authStatus: authStatus }).sort({ _id: -1 }).limit(count);
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

router.get("/main", async (req, res) => {
  const contents = await Contents.findOne({ type : "Guideline" }).sort({ _id : -1 })
  const list: any[] = contents?.list ?? []
  let result = []
  for(var item of list) {
    const tag = item.t;
    const sortBy = item.b;
    const sort = item.s;
    const filters = await Guideline.getListFromTagWithSort(tag, sortBy, sort, auth.AUTHORIZED);
    const data = {
      title: item.d,
      tag: tag,
      list: filters
    }
    result.push(data);
  }
  let top = await Guideline.top5();
  res.status(200).json({
    message: "Successfully read main contents.",
    top: top,
    contents: result
  })
})

router.get("/:id", async (req, res) => { // get _id guideline
  const _id = req.params.id;
  try {
    const result = await Guideline.getFromObjId(_id);
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

router.get("/uid/:uid", async (req, res) => { // get guidelines from user id
  const uid = req.params.uid;
  const authStatus = `${req.query.authStatus}` ?? auth.AUTHORIZED;
  try {
    const result = await Guideline.getListFromCreatorUid(uid, authStatus);
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

router.get("/tag/:tag", async (req, res) => { // get tagged guidelines
  const tag = req.params.tag.toLowerCase();
  const authStatus = `${req.query.authStatus}` ?? auth.AUTHORIZED;
  try {
    const result = await Guideline.getListFromTag(tag, authStatus);
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

export default router;
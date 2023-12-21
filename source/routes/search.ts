import express from 'express';
import { Filter } from '../models/filter';
import { User } from '../models/user';
import { Guideline } from '../models/guideline';
import { Contents } from '../models/contents';
import { Faq, FaqAnswer } from '../models/faq';

const router = express.Router();

router.get("/:keyword" ,async (req, res) => {
  const keyword = req.params.keyword;
  // creator, guideline, filter
  if (keyword === "") {
    res.status(200).json({
      statusCode: -1,
      message: "Empty keyword.",
      result: {}
    })
    return;
  }
  const creator = await User.search(keyword);
  const guideline = await Guideline.newSearch(keyword);
  const filter = await Filter.newSearch(keyword);
  const result = {
    creator,
    guideline,
    filter
  }
  res.status(200).json({
    statusCode: 0,
    message: "Success",
    result: result
  })
})

export default router;

import { Request, Response } from 'express';
import { User } from '../models/user.model';
import { Filter } from '../models/filter.model';
import { Guideline } from '../models/guideline.model';

export const getAnything = async (req: Request, res: Response) => {
  const keyword = req.params.keyword;

  try{
    // creator, guideline, filter
    if (keyword === "") {
      throw new Error("Empty keyword")
    }
    const creator = await User.search(keyword);
    const guideline = await Guideline.newSearch(keyword);
    const filter = await Filter.newSearch(keyword);
    res.status(200).json({
      statusCode: 0,
      message: "Success",
      result: {
        creator: creator,
        guideline: guideline,
        filter: filter
      }
    })
  } catch (error) {
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    });
  }
};

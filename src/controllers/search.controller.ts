import { Request, Response } from 'express';
import { User } from '../models/user.model';
import { Filter } from '../models/filter.model';
import { Guideline } from '../models/guideline.model';

export const getSomethingByKeyword = async (req: Request, res: Response) => {
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
};

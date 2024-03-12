import { Request, Response } from 'express';
import { CustomRequest } from '../types/customRequest';
import { User } from '../models/user.model';
import { Filter } from '../models/filter.model';
import { Guideline } from '../models/guideline.model';
import { PhotoZone } from '../models/photoZone.model';
import logger from '../config/logger';

export const searchCreators = async (req: Request, res: Response) => {
  const keyword = req.params.keyword;

  try{
    const creators = await User.search(keyword); // 대소문자 구분 x, 한글 검색 가능, 한글자부터 검색 가능
                                                 // User.search에서, bio 제거?
    res.status(200).json({
      statusCode: 0,
      message: "Success search creators",
      result: {
        creators: creators
      }
    })
    logger.info("Successfully search creators");
  } catch(error){
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    });
    logger.error(`Error search creators: ${error}`);
  }
}

export const searchGuidelines = async (req: CustomRequest, res: Response) => {
  const keyword = req.params.keyword;
  const authCode: any = req.query.code;

  try{
    const guidelines = await Guideline.searchbyTitleOrTag(keyword, authCode);

    res.status(200).json({
      statusCode: 0,
      message: "Success search guidelines",
      result: {
        guidelines: guidelines
      }
    })
    logger.info("Successfully search guidelines");
  } catch(error){
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    });
    logger.error(`Error search guidelines: ${error}`);
  }
}

export const searchFilters = async (req: Request, res: Response) => {
  const keyword = req.params.keyword;

  try{
    const filters = await Filter.searchbyTitleOrTag(keyword);

    res.status(200).json({
      statusCode: 0,
      message: "Success search filters",
      result: {
        filters: filters
      }
    })
    logger.info("Successfully search filters");
  } catch(error){
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    });
    logger.error(`Error search filters: ${error}`);
  }
}

export const getAnything = async (req: Request, res: Response) => {
  const keyword = req.params.keyword;

  try{
    // creator, guideline, filter, photoZone
    if (keyword === "") {
      throw new Error("Empty keyword")
    }
    const creator = await User.search(keyword);
    const guideline = await Guideline.newSearch(keyword);
    const filter = await Filter.newSearch(keyword);
    const photoZone = await PhotoZone.searchByKeyword(keyword);
    res.status(200).json({
      statusCode: 0,
      message: "Success",
      result: {
        creator: creator,
        guideline: guideline,
        filter: filter,
        photoZone: photoZone
      }
    })
    logger.info("Successfully get anything");
  } catch (error) {
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    });
    logger.error(`Error get anything: ${error}`);
  }
};

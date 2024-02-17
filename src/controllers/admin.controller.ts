import { Request, Response } from 'express';
import { Contents } from '../models/contents.model';
import { Faq, FaqAnswer } from '../models/faq.model';
import { Status } from '../models/servserStatus.model';
import { Auth } from '../models/auth.model';
import { Filter } from '../models/filter.model';
import { Guideline } from '../models/guideline.model';
import logger from '../config/logger';

export const postStatus = async (req: Request, res: Response) => {
  const code: string = `${req.query.code}`;
  const upload: boolean = req.query.upload === "true";
  // code -> 0 = 서버 정상
  // 1 -> 점검중
  // 2 -> 테스트 플라이트 전용
  try{
    let currentStatus = await Status.findOne({})
    currentStatus!.code = parseInt(code)
    currentStatus!.canUpload = upload;
    await currentStatus?.save()
    res.status(200).json({
      statusCode: 0,
      message: "Success",
      result: {}
    })
    logger.info("Successfully post status");
  } catch (error) {
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    })
    logger.error(`Error post status: ${error}`);
  }
};

export const getContent = async (req: Request, res: Response) => {
  const type = `${req.query.type}`;

  try{
    const result = await Contents.findOne({ type: type }).sort({ _id: -1 });
    if (!result) {
      res.status(400).json({
        statusCode: -1,
        message: "Empty content list",
        result: {}        
      })
      logger.error("Empty content list");
    } else{
      res.status(200).json({
        statusCode: 0,
        message: "Successfully read content list",
        result: result
      });
      logger.info("Successfully get content");
    }
  } catch (error) {
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    })
    logger.error(`Error get content: ${error}`);
  }
};

export const getContents = async (req: Request, res: Response) => {
  const type = `${req.query.type}`;

  try{
    const result = await Contents.find({ type: type }).sort({ _id: -1 });
    if (!result) {
      res.status(400).json({
        statusCode: -1,
        message: "Empty contents list",
        result: {}        
      })
      logger.error("Empty contents list");
    } else{
      res.status(200).json({
        statusCode: 0,
        message: "Successfully read contents list",
        result: result
      });
      logger.info("Successfully get contents");
    }
  } catch (error) {
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    })
    logger.error(`Error get contents: ${error}`);
  }
};

export const postContents = async (req: Request, res: Response) => {
  const newData = req.body.data;

  try {
    const newContents = new Contents(newData);
    await newContents.save();
    res.status(200).json({
      statusCode: 0,
      message: "Success",
      result: newContents
    });
    logger.info("Successfully post contents");
  } catch(error) {
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    })
    logger.error(`Error post contents: ${error}`);
  }
};

export const getFaqs = async (req: Request, res: Response) => {
  try{
    const faqs = await Faq.list();
    res.status(200).json({
      statusCode: 0,
      message: "Successfully faqs read.",
      result: faqs
    })
    logger.info("Successfully get faqs");
  } catch (error) {
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    })
    logger.error(`Error get faqs: ${error}`);
  }
};

export const getProducts = async (req: Request, res: Response) => {
  const type = req.query.type;
  const code = req.query.code;
  if (type === "Filter") {
    try {
      const filtered = await Filter.aggregate([
        {
          $lookup: {
            from: "auth",
            localField: "_id",
            foreignField: "productId",
            as: "authStatus"
          }
        },
        {
          $unwind: "$authStatus"
        },
        {
          $match: {
            'authStatus.code': code
          }
        },
        {
          $sort: {
            _id: -1
          }
        }
      ]);
      const filteredIds = filtered.map(item => item._id).reverse();
      const result = await Filter.find({ _id: filteredIds })
        .populate('likedCount')
        .populate('wishedCount')
        .populate('usedCount')
        .populate('authStatus')
        .populate('creator');
      res.status(200).json({
        statusCode: -1,
        message: "Successfully load filters",
        result: result
      })
      logger.info("Successfully get filters");
    } catch(error) {
      res.status(500).json({
        statusCode: -1,
        message: error,
        result: {}
      })
      logger.error(`Error get filters: ${error}`);
    }
  } else if (type === "Guideline") {
    try {
      const filtered = await Guideline.aggregate([
        {
          $lookup: {
            from: "auth",
            localField: "_id",
            foreignField: "productId",
            as: "authStatus"
          }
        },
        {
          $unwind: "$authStatus"
        },
        {
          $match: {
            'authStatus.code': code
          }
        },
        {
          $sort: {
            _id: -1
          }
        }
      ]);
      const filteredIds = filtered.map(item => item._id).reverse();
      const result = await Guideline.find({ _id: filteredIds })
        .populate('likedCount')
        .populate('wishedCount')
        .populate('usedCount')
        .populate('authStatus')
        .populate('creator');
      res.status(200).json({
        statusCode: -1,
        message: "Successfully load guidelines",
        result: result
      })
      logger.info("Successfully get guidelines");
    } catch(error) {
      res.status(500).json({
        statusCode: -1,
        message: error,
        result: {}
      })
      logger.error(`Error get guidelines: ${error}`);
    }
  }
};

export const postFaqAnswer = async (req: Request, res: Response) => {
  const faqId = req.params.faqId;
  const { title, content } = req.body;

  try{
    const answerData = {
      faqId, title, content, createdAt: Date.now()
    }
    const newAnswer = await FaqAnswer.create(answerData);
    res.status(200).json({
      statusCode: 0,
      message: "Successfully answer uploaded",
      result: newAnswer
    })
    logger.info("Successfully post faq answer");
  } catch (error) {
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    })
    logger.error(`Error post faq answer: ${error}`);
  }
};

export const postAuth = async (req: Request, res: Response) => {
  const type = `${req.body.type}`;
  const productId = `${req.body.productId}`;
  const code = `${req.body.code}`;
  const message = req.body.message;
  if (!type || !productId || !code || !message) {
    logger.error("essential data not found.");
    return res.status(200).json({
      statusCode: -1,
      message: "essential data not found.",
      result: {}
    });
  }

  try {
    const result = await Auth.findOneAndUpdate({ productId }, { code, lastAt: Date.now(), message }, { new: true });
    res.status(200).json({
      statusCode: 0,
      message: "Success",
      result: result
    })
    logger.info("Successfully post auth");
  } catch(error) {
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    })
    logger.error(`Error post auth: ${error}`);
  }
};

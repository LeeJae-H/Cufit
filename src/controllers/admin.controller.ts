import { Request, Response } from 'express';
import { Contents } from '../models/contents.model';
import { Faq, FaqAnswer } from '../models/faq.model';
import { Status } from '../models/servserStatus.model';
import { Auth } from '../models/auth.model';
import { Filter } from '../models/filter.model';
import { Guideline } from '../models/guideline.model';
import logger from '../config/logger';
import { PopularTag } from '../models/popularTag.model';
import { TodayPhotoZone } from '../models/todayPhotoZone.model';
import { TodayGuideline } from '../models/todayGuideline.model';
import { PhotoZone } from '../models/photoZone.model';
import { TrendingPose } from '../models/tredingPose.model';

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

export const getTagList = async (req: Request, res: Response) => {
  try{
    const tagList = await PopularTag.find();
    res.status(200).json({
      statusCode: 0,
      message: "Success",
      result: tagList
    })
    logger.info("Successfully get tag-list");
  } catch(error){
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    })
    logger.error(`Error get tag-list: ${error}`);
  }
};

export const uploadTagList = async (req: Request, res: Response) => {
  const { name, imageUrl, present } = req.body;
  const createdAt = Date.now();

  try{
    const tag = new PopularTag({
      name: name,
      createdAt:createdAt,
      imageUrl: imageUrl,
      present: present
    })
    await tag.save();
    res.status(200).json({
      statusCode: 0,
      message: "Success",
      result: tag
    })
    logger.info("Successfully upload tag-list");
  } catch(error){
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    })
    logger.error(`Error upload tag-list: ${error}`);
  }
};

export const modifyTagList = async (req: Request, res: Response) => {
  const { name, imageUrl, present } = req.body;
  const createdAt = Date.now();
  
  try{
    const tag = await PopularTag.findOne({ name: name });

    if (!tag) {
      return res.status(404).json({
        statusCode: -1,
        message: "Tag not found",
        result: {}
      });
    }

    if (name) tag.name = name;
    if (imageUrl) tag.imageUrl = imageUrl;
    if (present) tag.present = present;
    tag.createdAt = createdAt;

    await tag.save();

    res.status(200).json({
      statusCode: 0,
      message: "Success",
      result: tag
    })
    logger.info("Successfully modify tag-list");
  } catch(error){
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    })
    logger.error(`Error modify tag-list: ${error}`);
  }
};

export const getTodayPhotoZones = async (req: Request, res: Response) => {
  try{
    const photoZones = await TodayPhotoZone.find();
    // 여기에 포토존 정보를 포함해서 반환해야합니다.
    res.status(200).json({
      statusCode: 0,
      message: "Success",
      result: photoZones
    })
    logger.info("Successfully get photozones");
  } catch(error){
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    })
    logger.error(`Error get photozones: ${error}`);
  }
};

export const uploadPhotoZone = async (req: Request, res: Response) => {
  try {
    const { title, productId, description, imageUrl } = req.body;
    const createdAt = Date.now();

    const photoZone = new TodayPhotoZone({
      title: title,
      createdAt: createdAt,
      productId: productId,
      description: description,
      imageUrl: imageUrl
    });
    await photoZone.save();

    res.status(200).json({
        statusCode: 0,
        message: "Successfully upload photozone",
        result: photoZone
    });
  } catch (error) {
    logger.error('Error upload photozone:', error);
    res.status(500).json({
        statusCode: -1,
        message: error,
        result: {}
    });
  }
};

export const modifyPhotoZone = async (req: Request, res: Response) => {
  const { title, productId, description, imageUrl } = req.body;
  const createdAt = Date.now();
  
  try{
    const photoZone = await TodayPhotoZone.findOne({ productId: productId });

    if (!photoZone) {
      return res.status(404).json({
        statusCode: -1,
        message: "photoZone not found",
        result: {}
      });
    }

    if (title) photoZone.title = title;
    if (productId) photoZone.productId = productId;
    if (description) photoZone.description = description;
    if (imageUrl) photoZone.imageUrl = imageUrl;
    photoZone.createdAt = createdAt;

    await photoZone.save();

    res.status(200).json({
      statusCode: 0,
      message: "Success",
      result: photoZone
    })
    logger.info("Successfully modify photozone");
  } catch(error){
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    })
    logger.error(`Error modify photozone: ${error}`);
  }
};

export const getTodayGuidelines = async (req: Request, res: Response) => {
  try{
    const guidelines = await TodayGuideline.find();
    // 여기에 가이드라인 정보를 포함해서 반환해야합니다.
    res.status(200).json({
      statusCode: 0,
      message: "Success",
      result: guidelines
    })
    logger.info("Successfully get guidelines");
  } catch(error){
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    })
    logger.error(`Error get guidelines: ${error}`);
  }
};

export const uploadGuideline = async (req: Request, res: Response) => {
  try {
    const { title, productId, description, imageUrl } = req.body;
    const createdAt = Date.now();

    const guideline = new TodayGuideline({
      title: title,
      createdAt: createdAt,
      productId: productId,
      description: description,
      imageUrl: imageUrl
    });
    await guideline.save();

    res.status(200).json({
        statusCode: 0,
        message: "Successfully upload guideline",
        result: guideline
    });
  } catch (error) {
    logger.error('Error upload guideline:', error);
    res.status(500).json({
        statusCode: -1,
        message: error,
        result: {}
    });
  }
};

export const modifyGuideline = async (req: Request, res: Response) => {
  const { title, productId, description, imageUrl } = req.body;
  const createdAt = Date.now();
  
  try{
    const guideline = await TodayGuideline.findOne({ productId: productId });

    if (!guideline) {
      return res.status(404).json({
        statusCode: -1,
        message: "guideline not found",
        result: {}
      });
    }

    if (title) guideline.title = title;
    if (productId) guideline.productId = productId;
    if (description) guideline.description = description;
    if (imageUrl) guideline.imageUrl = imageUrl;
    guideline.createdAt = createdAt;

    await guideline.save();

    res.status(200).json({
      statusCode: 0,
      message: "Success",
      result: guideline
    })
    logger.info("Successfully modify guideline");
  } catch(error){
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    })
    logger.error(`Error modify guideline: ${error}`);
  }
};

export const allGuidelines = async (req: Request, res: Response) => {
  const page = Number(req.query.page) ?? 1;
  const code = String(req.query.code);

  try {
    const guidelines = await Guideline.findAll(page, code);
    res.status(200).json({
      statusCode: 0,
      message: "Success",
      result: guidelines
    })
    logger.info(`Successfully fetch allGuidelines`);
  } catch(error) {
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    })
    logger.error(`Error while fetching allGuidelines: ${error}`);
  }
}

export const allPhotozones = async (req: Request, res: Response) => {
  const page = Number(req.query.page) ?? 1;
  const code = String(req.query.code);

  try {
    const photozone = await PhotoZone.findAll(page, code);
    res.status(200).json({
      statusCode: 0,
      message: "Success",
      result: photozone
    })
    logger.info(`Successfully fetch allphotozone`);
  } catch(error) {
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    })
    logger.error(`Error while fetching allphotozone: ${error}`);
  }
}

export const getTrendingPoseList = async (req: Request, res: Response) => {
  try{
    const tagList = await TrendingPose.find();
    res.status(200).json({
      statusCode: 0,
      message: "Success",
      result: tagList
    })
    logger.info("Successfully get tag-list");
  } catch(error){
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    })
    logger.error(`Error get tag-list: ${error}`);
  }
};

export const uploadTrendingPoseList = async (req: Request, res: Response) => {
  const { name, imageUrl, present } = req.body;
  const createdAt = Date.now();

  try{
    const guidelines = await Guideline.getListFromTag(name);
    if (guidelines.length <= 0) {
      let error = `No guideline found with tag '${name}'`
      logger.error(`Error upload tag-list: ${error}`);
      return res.status(500).json({
        statusCode: -2,
        message: error,
        result: {}
      })
    };
    const tag = new TrendingPose({
      name: name,
      createdAt:createdAt,
      imageUrl: imageUrl,
      present: present
    })
    await tag.save();
    res.status(200).json({
      statusCode: 0,
      message: "Success",
      result: tag
    })
    logger.info("Successfully upload tag-list");
  } catch(error){
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    })
    logger.error(`Error upload tag-list: ${error}`);
  }
};

export const modifyTrendingPoseList = async (req: Request, res: Response) => {
  const { name, imageUrl, present } = req.body;
  const createdAt = Date.now();
  
  try{
    const tag = await TrendingPose.findOne({ name: name });

    if (!tag) {
      return res.status(404).json({
        statusCode: -1,
        message: "Tag not found",
        result: {}
      });
    }

    if (name) tag.name = name;
    if (imageUrl) tag.imageUrl = imageUrl;
    if (present) tag.present = present;
    tag.createdAt = createdAt;

    await tag.save();

    res.status(200).json({
      statusCode: 0,
      message: "Success",
      result: tag
    })
    logger.info("Successfully modify tag-list");
  } catch(error){
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    })
    logger.error(`Error modify tag-list: ${error}`);
  }
};

// deletes

export const deleteTagList = async (req: Request, res: Response) => {
  const { _id } = req.body;
  try {
    await PopularTag.deleteOne({ _id });
    res.status(200).json({
      statusCode: 0,
      message: "Success",
      result: {}
    })
  } catch (error) {
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    })
    logger.error(`Error delete tag-list: ${error}`);
  }
}

export const deleteTrendingPose = async (req: Request, res: Response) => {
  const { _id } = req.body;
  try {
    await TrendingPose.deleteOne({ _id });
    res.status(200).json({
      statusCode: 0,
      message: "Success",
      result: {}
    })
  } catch (error) {
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    })
    logger.error(`Error delete trending pose: ${error}`);
  }
}

export const deleteTodayGuideline = async (req: Request, res: Response) => {
  const { _id } = req.body;
  try {
    await TodayGuideline.deleteOne({ _id });
    res.status(200).json({
      statusCode: 0,
      message: "Success",
      result: {}
    })
  } catch (error) {
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    })
    logger.error(`Error delete trending pose: ${error}`);
  }
}

export const deleteTodayPhotozone = async (req: Request, res: Response) => {
  const { _id } = req.body;
  try {
    await TodayPhotoZone.deleteOne({ _id });
    res.status(200).json({
      statusCode: 0,
      message: "Success",
      result: {}
    })
  } catch (error) {
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    })
    logger.error(`Error delete trending pose: ${error}`);
  }
}
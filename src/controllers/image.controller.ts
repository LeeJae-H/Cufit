import { Request, Response } from 'express';
import s3 from '../config/storage';  
import logger from '../config/logger';

export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const type = req.body.type;
    const file = req.file;
    const { originalname, buffer } = file;
    const fileType = originalname.split('.').pop();
    const params = {
        Bucket: "cufit-staging-image-bucket",
        Key: `${type}/${Date.now()}.${fileType}`,
        Body: buffer,
        ContentType: file.mimetype,
    };
    const uploadResult = await s3.upload(params).promise();
    const imageUrl = uploadResult.Location;  
    res.status(200).json({
      statusCode: 0,
      message: "Successfully image uploaded",
      result: {
        url: imageUrl,
        type: type
      }
    });  
    logger.info("Successfully upload image")
  } catch (error) {
    res.status(500).json({
      statusCode: -1,
      message : error,
      result: {}
    });
    logger.error(`Error upload image: ${error}`);
  }
};

export const deleteImage = async (req: Request, res: Response) => {
  const fileName = req.body.fileName;
  const type = req.body.type;

  try {
    const result = await s3.deleteObject({ 
        Bucket: 'cufit-staging-image-bucket', 
        Key: `${type}/${fileName}.png`
    }).promise();

    res.status(200).json({
      statusCode: 0,
      message: "Successfully image deleted",
      result: result
    });
    logger.info("Successfully delete image");
  } catch (error) {
    res.status(500).json({
      statusCode: -1,
      message : error,
      result: {}
    });  
    logger.error(`Error delete image: ${error}`);
  }
};

  
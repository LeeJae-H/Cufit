import { Request, Response } from 'express';
import s3 from '../config/storage';  
import { v4 as uuidv4 } from 'uuid';

export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const file = req.file;
    const { originalname, buffer } = file;
    const key = `${uuidv4()}_${originalname}`;
    const params = {
        Bucket: "cufit-staging-image-bucket",
        Key: key,
        Body: buffer,
        ContentType: file.mimetype,
    };
    const uploadResult = await s3.upload(params).promise();
    const imageKey = uploadResult.Key;  
    res.json(imageKey);  

} catch (error) {
    console.error(error);
    res.status(500).json({message : 'Server Error'});
  }
};

export const deleteImage = async (req: Request, res: Response) => {
  const key = req.body.key;
  try {
    const result = await s3.deleteObject({ 
        Bucket: 'cufit-staging-image-bucket', 
        Key: key
    }).promise();
    res.json(result);

  } catch (error) {
    console.error(error);
    res.status(500).json({message : 'Server Error'});
  }
};

  
import { Request, Response } from 'express';
import s3 from '../config/storage';  

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
    res.json({
      statusCode: 0,
      message: "Image uploaded successfully.",
      result: {
        url: imageUrl,
        type: type
      }
    });  

} catch (error) {
    console.error(error);
    res.status(500).json({message : 'Server Error'});
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

    res.json({
      statusCode: 0,
      message: "Success",
      result
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({message : 'Server Error'});
  }
};

  
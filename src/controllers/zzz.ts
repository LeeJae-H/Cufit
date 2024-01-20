import { Request, Response } from 'express';
import UserModel from '../models/zzz';
import s3 from '../config/storage';  
import { v4 as uuidv4 } from 'uuid';

export const saveUser = async (req: Request, res: Response) => {
  const { name, email } = req.body;

  try {
    const newUser = new UserModel({ name, email });
    await newUser.save();
    res.json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({message : 'Server Error'});
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await UserModel.find();

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({message : 'Server Error'});
  }
};

export const getUser = async (req: Request, res: Response) => {
  const userName = req.params.name;

  try {
    const user = await UserModel.findOne({ name: userName });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({message : 'Server Error'});
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const userName = req.params.name;
  const { name, email } = req.body;

  try {
    const user = await UserModel.findOne({ name: userName });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.name = name || user.name;
    user.email = email || user.email;
    await user.save();
    
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({message : 'Server Error'});
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const userName = req.params.name;

  try {
    const user = await UserModel.findOne({ name: userName });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    await user.deleteOne(); 

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({message : 'Server Error'});
  }
};

export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const { name, email } = req.body;
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
    const user = new UserModel({
      name: name,
      email: email,
      imageKey: imageKey,
    });
    await user.save();

    res.json({ message: 'Upload image successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({message : 'Server Error'});
  }
};

export const getImage = async (req: Request, res: Response) => {
  const imageName = req.params.name;

  try {
    const imageData = await UserModel.findOne({ name: imageName });
    if (!imageData) {
      return res.status(404).json({ error: 'Image not found' });
    }
    const imageKey = imageData.imageKey;
    const s3Object = await s3.getObject({ Bucket: 'cufit-staging-image-bucket', Key: imageKey }).promise();

    if (s3Object.ContentType) {
      res.setHeader('Content-Type', s3Object.ContentType);
      res.send(s3Object.Body);
    } else {
      res.status(500).json({ error: 'Content Type not available' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({message : 'Server Error'});
  }
};

import { Request, Response } from 'express';
import { CustomRequest } from '../types/customRequest';
import { PhotoZone } from '../models/photoZone.model';
import { User } from '../models/user.model';
import { Review } from '../models/review.model';
import { Double } from 'aws-sdk/clients/apigateway';
import logger from '../config/logger';
import mongoose from 'mongoose';
import { Follow } from '../models/follow.model';
import { Like } from '../models/like.model';
import { Wish } from '../models/wish.model';

export const uploadPhotozone = async (req: Request, res: Response) => {
  try {
    const {
      uid,
      title,
      placeName,
      location,
      description,
      shortDescription,
      imageUrls,
      tags,
    } = req.body;
    const createdAt = Date.now();
    var locationJSON: any = {};
    try{
      locationJSON = JSON.parse(location);
    } catch (error){
      throw new Error("Error while parsing location");
    }
    const newPhotoZone = new PhotoZone({
      uid,
      title,
      placeName,
      locationJSON,
      description,
      shortDescription,
      imageUrls: imageUrls.split(','),
      tags: tags.split(','),
      createdAt
    });

    await newPhotoZone.save();
    res.status(200).json({
        statusCode: 0,
        message: "Successfully upload photozone",
        result: newPhotoZone
    });
  } catch (error) {
    logger.error('Error uploading photo zone:', error);
    res.status(500).json({
        statusCode: -1,
        message: error,
        result: {}
    });
  }
}

export const deletePhotozone = async (req: CustomRequest, res: Response) => {
  try {
    const photoZoneId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(photoZoneId)) {
      throw new Error('Invalid photoZoneId');
    }

    const deletedPhotoZone = await PhotoZone.deleteOne({ _id: photoZoneId });

    if (deletedPhotoZone.deletedCount === 0) {
      throw new Error('photoZone not found');
    }

    res.status(200).json({
        statusCode: 0,
        message: "Successfully delete photozone",
        result: {}
    });
  } catch (error) {
    logger.error('Error deleting photo zone:', error);
    res.status(500).json({
        statusCode: -1,
        message: error,
        result: {}
    });
  }
}

export const updatePhotozone = async (req: CustomRequest, res: Response) => {
  try {
    const uid = req.uid!;
    const updateData = req.body;

    const updatedPhotoZone = await PhotoZone.findOneAndUpdate(
        { uid: uid }, 
        updateData, 
        { new: true } // 옵션: 업데이트 후의 문서 반환 여부 -> updatedPhotoZone 변수에 업데이트 후의 문서가 할당됨
      );

    res.status(200).json({
        statusCode: 0,
        message: "Successfully update photozone",
        result: updatedPhotoZone
    });
  } catch (error) {
    logger.error('Error updating photo zone:', error);
    res.status(500).json({
        statusCode: -1,
        message: error,
        result: {}
    });  
  }
}

export const getPhotozoneByDistance = async (req: Request, res: Response) => {
  if (!req.query.lat || !req.query.lng) {
    logger.error("Lack of essential data");
    return res.status(400).json({
      statusCode: -1,
      message: "Lack of essential data",
      result: {}
    })
  }
  
  try{
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const distanceString = req.query.distance === undefined ? "1000" : `${req.query.distance}`
    const distance = parseFloat(distanceString);
    const result = await PhotoZone.findByDistance(lat, lng, distance);
    res.status(200).json({
      statusCode: 0,
      message: "Success",
      result: result
    })
    logger.info("Successfully get photozone by distance");
  } catch (error) {
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    })
    logger.error(`Error get photozone by distance: ${error}`);
  }
}

export const searchPhotozones = async (req: Request, res: Response) => {
  try{
    const keyword = req.params.keyword;
    const photozones = await PhotoZone.searchByKeyword(keyword);

    res.status(200).json({
      statusCode: 0,
      message: "Success search photozones",
      result: {
        photozones: photozones
      }
    })
    logger.info("Successfully search photozones");
  } catch(error){
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    });
    logger.error(`Error search photozones: ${error}`);
  }
}

export const getDetail = async (req: Request, res: Response) => {
  try{
    const uid = `${req.query.uid}`;
    const cid = `${req.query.cid}`;
    const type = `${req.query.type}`;
    const photoZoneId = req.params.photoZoneId;

    if (!cid || !photoZoneId || !type) {
      logger.error("Lack of essential data");
      return res.status(400).json({
        statusCode: -1,
        message: "Lack of essential data",
        result: {}
      })
    }
    
    const creator = await User.getFromUid(cid);
    let isFollowed: Boolean = await Follow.isFollowed(uid, cid);
    let isLiked: Boolean = await Like.isExist(photoZoneId, uid, type);
    let isWished: Boolean = await Wish.isExist(photoZoneId, uid, type);
    
    res.status(200).json({
      statusCode: 0,
      message: "Success",
      result: {
        creator: creator,
        isFollowed,
        isLiked,
        isWished,
      }
    })
    logger.info("Successfully get detail");
  } catch(error){
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    })
    logger.error(`Error get detail: ${error}`);
  }
}

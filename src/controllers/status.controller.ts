import { Request, Response } from 'express';
import { Status } from '../models/servserStatus.model';

export const getStatus = async (req: Request, res: Response) => {
  const currentStatus = await Status.findOne({})
  if (!currentStatus) {
    res.status(200).json({
      statusCode: -1,
      message: "Error",
      result: -1
    })
  } else {
    res.status(200).json({
      statusCode: 0,
      message: "Success",
      result: currentStatus
    })
  }
};
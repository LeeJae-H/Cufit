import { Request, Response } from 'express';
import { CustomRequest } from '../types/customRequest';
import { Income } from '../models/income.model';
import logger from '../config/logger';

export const getIncome = async (req: CustomRequest, res: Response) => {
  const uid = req.uid!;
  const status: string = `${req.query.status}`;
  const free: Boolean = req.query.free === "true";

  try {
    const result = await Income.find({
      uid: uid,
      status: status,
      amount: free ? { $gte: 0 } : { $gt: 0 }
    })
    .populate("product")
    .populate("order");
    res.status(200).json({
      statusCode: 0,
      message: "Successfully load incomes",
      result: result
    })
    logger.info("Successfully get income")
  } catch(error) {
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    })
    logger.error(`Error get income: ${error}`);
  }
}
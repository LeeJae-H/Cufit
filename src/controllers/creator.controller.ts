import { Request, Response } from 'express';
import { Income } from '../models/income.model';
import * as admin from "firebase-admin";

export const getIncome = async (req: Request, res: Response) => {
  const idToken: string = req.params.idToken;

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid: String = decodedToken.uid;
    const status: string = `${req.query.status}`;
    const free: Boolean = req.query.free === "true";
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
  } catch(error) {
    res.status(500).json({
      statusCode: -1,
      message: error,
      result: {}
    })
  }
}
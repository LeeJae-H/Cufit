import express from 'express';
import { Filter } from '../models/filter';
import { Guideline } from '../models/guideline';
import { Income } from '../models/income';
import { Order } from '../models/order';
import { Auth } from '../models/auth';
import { Creator } from '../models/creator';
import * as admin from "firebase-admin";
const router = express.Router();

router.get("/income/:idToken", async (req, res) => {
  const idToken: string = req.params.idToken;
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid: String = decodedToken.uid;
    const status: string = `${req.query.status}`;
    const free: Boolean = req.query.free === "true";
    console.log("before result")
    const result = await Income.find({
      uid: uid,
      status: status,
      amount: free ? { $gte: 0 } : { $gt: 0 }
    })
    .populate("product")
    .populate("order");
    console.log(result)
    res.status(200).json({
      statusCode: 0,
      message: "Successfully load incomes",
      result
    })
    return;
  } catch(error) {
    console.error("error")
    console.error(error)
    res.status(200).json({
      statusCode: -1,
      message: error,
      result: {}
    })
  }
})

export default router;

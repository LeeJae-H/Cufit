import express from 'express';
import verifyIdToken from '../middlewares/authMiddleware';
import { getIncome } from '../controllers/creator.controller';

const router = express.Router();

router.get("/income", verifyIdToken, getIncome);

export default router;

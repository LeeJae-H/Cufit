import express from 'express';
import { getIncome } from '../controllers/creator.controller';

const router = express.Router();

router.get("/income", getIncome);

export default router;

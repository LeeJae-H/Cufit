import express from 'express';
import { getStatus } from '../controllers/status.controller';

const router = express.Router();

router.get("/", getStatus); 

export default router;

import express from 'express';
import admin from './admin';
import filter from './filter';
import guideline from './guideline';
import image from './image';
import product from './product';
import user from './user';
import search from './search';
import { Status } from '../models/servserStatus';
const router = express.Router();

router.use('/admin', admin);
router.use('/filter', filter);
router.use('/guideline', guideline);
router.use('/image', image);
router.use('/product', product);
router.use('/user', user);
router.use('/search', search);
router.get('/status', async(req, res) => {
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
})

export default router;
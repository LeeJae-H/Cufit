import express from 'express';
import admin from './admin';
import filter from './filter';
import guideline from './guideline';
import image from './image';
import product from './product';
import user from './user';
const router = express.Router();

router.use('/admin', admin);
router.use('/filter', filter)
router.use('/guideline', guideline)
router.use('/image', image)
router.use('/product', product)
router.use('/user', user)

export default router;
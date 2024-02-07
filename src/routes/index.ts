import express from 'express';
import admin from './admin.route';
import creator from './creator.route';
import filter from './filter.route';
import guideline from './guideline.route';
import image from './image.route';
import product from './product.route';
import search from './search.route';
import stts from './status.route';
import user from './user.route';

const router = express.Router();

router.use('/admin', admin);
router.use('/creator', creator);
router.use('/filter', filter);
router.use('/guideline', guideline);
router.use('/image', image);
router.use('/product', product);
router.use('/search', search);
router.use('/status', stts);
router.use('/user', user);

export default router;
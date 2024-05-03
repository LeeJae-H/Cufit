import express from 'express';
import admin from './admin.route';
import creator from './creator.route';
import filter from './filter.route';
import guideline from './guideline.route';
import image from './image.route';
import photozone from './photoZone.route';
import product from './product.route';
import search from './search.route';
import stts from './status.route';
import user from './user.route';

const router = express.Router();

router.use('/admin', admin);
router.use('/creators', creator);
router.use('/filters', filter);
router.use('/guidelines', guideline);
router.use('/images', image);
router.use('/main', main);
router.use('/photozones', photozone);
router.use('/products', product);
router.use('/search', search);
router.use('/status', stts);
router.use('/users', user);

export default router;

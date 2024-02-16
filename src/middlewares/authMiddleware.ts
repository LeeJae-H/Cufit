import { Response, NextFunction } from 'express';
import { CustomRequest } from '../types/customRequest';
import admin from 'firebase-admin';
import logger from '../config/logger';

const verifyIdToken = async (req: CustomRequest, res: Response, next: NextFunction) => {
  const { idToken } = req.body;

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.uid = decodedToken.uid;
    logger.info('ID token verified successfully.');
    next();
  } catch (error) {
    res.status(400).json({
      statusCode: -1,
      message: 'Invalid or expired token',
      result: {}
    });
    logger.error(`Invalid or expired token: ${error}`);
  }
};

export default verifyIdToken;
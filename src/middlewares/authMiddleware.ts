import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';

const verifyIdToken = async (req: Request, res: Response, next: NextFunction) => {
  const { idToken } = req.body;

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.uid = decodedToken.uid;
    next();
  } catch (error) {
    res.status(400).json({
      statusCode: -1,
      message: 'Invalid or expired token',
      result: {}
    });
  }
};

export default verifyIdToken;

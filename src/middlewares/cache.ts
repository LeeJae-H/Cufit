import { Request, Response, NextFunction } from 'express';

const cacheMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // const period = 60 * 5; // 5분
  const period = 10;
  
  if (req.method === 'GET') {
    res.set('Cache-control', `public, max-age=${period}`);
  } else {
    res.set('Cache-control', 'no-store');
  }

  next();
};

export default cacheMiddleware;

"use strict";
// import { Request, Response, NextFunction } from 'express';
// const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
//   const { authorization } = req.headers;
//   if (!authorization || !authorization.startsWith('Bearer ')) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }
//   const idToken = authorization.split('Bearer ')[1];
//   try {
//     // Verify Firebase ID Token
//     const decodedToken = await admin.auth().verifyIdToken(idToken);
//     req.user = decodedToken; // 사용자 정보를 요청 객체에 추가
//     next(); // 다음 미들웨어 또는 라우트 핸들러로 전달
//   } catch (error) {
//     return res.status(401).json({ error: 'Invalid ID Token' });
//   }
// };
// export default authenticateUser;

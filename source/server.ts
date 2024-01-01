import express from 'express';
import { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import routes from './routes/index';
import mongoose from 'mongoose';
import * as admin from 'firebase-admin';
import serviceAccount from './firebasekey.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
});
const uri = 'mongodb+srv://jhlee:jhlee@imicainstance.h807wuk.mongodb.net/Cufit?retryWrites=true&w=majority';

const app = express();
const port = 3030;
let setCache = function (req: Request, res: Response, next: NextFunction) {
  const period = 60 * 5;
  if (req.method == 'GET') {
    res.set('Cache-control', `public, max-age=${period}`);
  } else {
    res.set('Cache-control', 'no-store');
  }

  next();
}
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({ origin: true, credentials: true }));

app.use('/', routes);
app.use(setCache);
try {
  mongoose.connect(uri);
} catch(error) {
  console.error("Cannot connect to mongodb with mongoose.")
  console.error("-------------------Reason----------------")
  console.error(error);
  console.error("-------------------Reason----------------")
}
console.log("Successfully connected to mongodb!");

app.listen(port, () => {
  console.log(`Server is running at ${port}`)
})

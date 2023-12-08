import express from 'express';
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

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({ origin: true, credentials: true }));

app.use('/', routes);

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

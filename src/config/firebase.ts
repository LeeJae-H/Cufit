import * as admin from 'firebase-admin';
import serviceAccount from '../../firebasekey.json';

const initFirebase = async () => {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
    });
    console.log("Firebase Admin SDK Initialized");
  } catch (error) {
    console.error(`Firebase Admin SDK Initializing Error : ${error}`);
    // throw error; // 호출하는 측에서 오류를 처리하도록 예외를 다시 던짐
  }
};

export default initFirebase;

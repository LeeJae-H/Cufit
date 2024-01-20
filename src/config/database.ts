import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error}`);
    // throw error; // 호출하는 측에서 오류를 처리하도록 예외를 다시 던짐
  }
};

export default connectDB;
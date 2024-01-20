import mongoose, { Document, Schema } from 'mongoose';

interface IUser extends Document {
  name: string;
  email: string;
  imageKey: string;
}

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  imageKey: {type: String }
}, { collection: 'user' });

const UserModel = mongoose.model<IUser>('User', UserSchema);

export default UserModel;

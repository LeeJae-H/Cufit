import mongoose, { Schema, Document, Model } from 'mongoose';

interface DBAuth {
  productId: mongoose.Schema.Types.ObjectId,
  productType: string,
  status: string,
  message: string,
  createdAt: number,
  lastAt: number
}

interface DBAuthDocument extends DBAuth, Document {

}

interface DBAuthModel extends Model<DBAuthDocument> {
  
}

const AuthSchema = new Schema<DBAuthDocument>({
  productId: {
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'productType'
  },
  productType: {
    required: true,
    type: String,
    enum: ['Filter', 'Guideline']
  },
  createdAt: {
    required: true,
    type: Number
  },
  status: {
    required: true,
    type: String,
    enum: ['authorized', 'unauthorized', 'denied']
  },
  lastAt: {
    required: true,
    type: Number
  },
  message: {
    required: true,
    type: String
  }
});

const Auth = mongoose.model<DBAuthDocument, DBAuthModel>("Auth", AuthSchema, "auth");
export { Auth, AuthSchema };
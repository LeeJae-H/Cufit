import mongoose, { Schema, Document, Model } from 'mongoose';

interface DBRequest {
  title: string,
  uid: string,
  content: string,
  createdAt: number
}

interface DBRequestDocument extends DBRequest, Document {

}

interface DBRequestModel extends Model<DBRequestDocument> {
  
}

const RequestSchema = new Schema<DBRequestDocument>({
  title: { required: true, type: String },
  uid: { required: true, type: String },
  content: { required: true, type: String },
  createdAt: { required: true, type: Number },
});

const RequestFunctions = mongoose.model<DBRequestDocument, DBRequestModel>("Request", RequestSchema, "request");
export { RequestFunctions, RequestSchema };
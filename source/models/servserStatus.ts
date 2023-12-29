import mongoose, { Schema, Document, Model } from 'mongoose';

interface DBStatus {
  code: number;
  canUpload: boolean;
}

interface DBStatusDocument extends DBStatus, Document {

}

interface DBStatusModel extends Model<DBStatusDocument> {
  
}

const StatusSchema = new Schema<DBStatusDocument>({
  code: { required: true, type: Number },
  canUpload: { required: true, type: Boolean }
});

const Status = mongoose.model<DBStatusDocument, DBStatusModel>("Status", StatusSchema, "status");
export { Status, StatusSchema };
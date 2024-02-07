import mongoose, { Schema, Document, Model } from 'mongoose';

interface DBCreator {
  uid: string;
  tel: Number;
  an: Number;
  bn: String;
  createdAt: Number;
}

interface DBCreatorDocument extends DBCreator, Document {

}

interface DBCreatorModel extends Model<DBCreatorDocument> {
  
}

const CreatorSchema = new Schema<DBCreatorDocument>({
  
});

const Creator = mongoose.model<DBCreatorDocument, DBCreatorModel>("Creator", CreatorSchema, "Creator");
export { Creator, CreatorSchema };
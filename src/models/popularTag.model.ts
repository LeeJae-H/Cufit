import mongoose, { Schema, Document, Model } from 'mongoose';

interface DBPopularTag {
  name: string;
  createdAt: number;
  imageUrl?: string;
  present: boolean;
}

interface DBPopularTagDocument extends DBPopularTag, Document {

}

interface DBPopularTagModel extends Model<DBPopularTagDocument> {
}

const PopularTagSchema: Schema<DBPopularTagDocument> = new Schema({
  name: {
    required: true,
    type: String,
  },
  createdAt: {
    required: true,
    type: Number,
  },
  imageUrl: {
    type: String,
  },
  present: {
    required: true,
    type: Boolean,
  }
});

const PopularTag = mongoose.model<DBPopularTagDocument, DBPopularTagModel>('PopularTag', PopularTagSchema, 'popularTag');

export { PopularTag, PopularTagSchema };
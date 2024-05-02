import mongoose, { Schema, Document, Model } from 'mongoose';

interface DBPopularGuideline {
  title: string;
  createdAt: number;
  productId: mongoose.Schema.Types.ObjectId;
  description: string;
  imageUrl?: string;
}

interface DBPopularGuidelineDocument extends DBPopularGuideline, Document {

}

interface DBPopularGuidelineModel extends Model<DBPopularGuidelineDocument> {
}

const PopularGuidelineSchema: Schema<DBPopularGuidelineDocument> = new Schema({
  title: {
    required: true,
    type: String,
  },
  createdAt: {
    required: true,
    type: Number,
  },
  productId: {
    required: true,
    type: mongoose.Schema.Types.ObjectId,
  },
  description: {
    required: true,
    type: String,
  },
  imageUrl: {
    type: String,
  },
});

const PopularGuideline = mongoose.model<DBPopularGuidelineDocument, DBPopularGuidelineModel>('PopularGuideline', PopularGuidelineSchema, 'popularGuideline');

export { PopularGuideline, PopularGuidelineSchema };
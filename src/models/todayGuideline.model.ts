import mongoose, { Schema, Document, Model } from 'mongoose';

interface DBTodayGuideline {
  title: string;
  createdAt: number;
  productId: mongoose.Schema.Types.ObjectId;
  description: string;
  imageUrl?: string;
}

interface DBTodayGuidelineDocument extends DBTodayGuideline, Document {

}

interface DBTodayGuidelineModel extends Model<DBTodayGuidelineDocument> {
}

const TodayGuidelineSchema: Schema<DBTodayGuidelineDocument> = new Schema({
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

const TodayGuideline = mongoose.model<DBTodayGuidelineDocument, DBTodayGuidelineModel>('TodayGuideline', TodayGuidelineSchema, 'todayGuideline');

export { TodayGuideline, TodayGuidelineSchema };
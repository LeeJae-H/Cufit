import mongoose, { Schema, Document, Model } from 'mongoose';

interface DBTodayPhotoZone {
  title: string;
  createdAt: number;
  productId: mongoose.Schema.Types.ObjectId;
  description: string;
  imageUrl?: string;
}

interface DBTodayPhotoZoneDocument extends DBTodayPhotoZone, Document {

}

interface DBTodayPhotoZoneModel extends Model<DBTodayPhotoZoneDocument> {
}

const TodayPhotoZoneSchema: Schema<DBTodayPhotoZoneDocument> = new Schema({
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

const TodayPhotoZone = mongoose.model<DBTodayPhotoZoneDocument, DBTodayPhotoZoneModel>('TodayPhotoZone', TodayPhotoZoneSchema, 'todayPhotoZone');

export { TodayPhotoZone, TodayPhotoZoneSchema };
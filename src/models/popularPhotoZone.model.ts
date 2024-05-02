import mongoose, { Schema, Document, Model } from 'mongoose';

interface DBPopularPhotoZone {
  title: string;
  createdAt: number;
  productId: mongoose.Schema.Types.ObjectId;
  description: string;
  imageUrl?: string;
}

interface DBPopularPhotoZoneDocument extends DBPopularPhotoZone, Document {

}

interface DBPopularPhotoZoneModel extends Model<DBPopularPhotoZoneDocument> {
}

const PopularPhotoZoneSchema: Schema<DBPopularPhotoZoneDocument> = new Schema({
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

const PopularPhotoZone = mongoose.model<DBPopularPhotoZoneDocument, DBPopularPhotoZoneModel>('PopularPhotoZone', PopularPhotoZoneSchema, 'popularPhotoZone');

export { PopularPhotoZone, PopularPhotoZoneSchema };
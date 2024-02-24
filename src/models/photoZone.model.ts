import mongoose, { Schema } from 'mongoose';

interface DBPhotoZone {
  uid: string;
  placeName: string;
  location: {
    type: string;
    coordinates: number[];
  };
  description: string;
  thumbnailImageUrl: string;
  imageUrls: [string];
  createdAt: number;
}

const PhotoZoneSchema: Schema<DBPhotoZone> = new Schema({
  uid: {
    required: true,
    type: String,
  },
  placeName: {
    required: true,
    type: String,
  },
  description: {
    required: true,
    type: String,
  },
  thumbnailImageUrl: {
    required: true,
    type: String,
  },
  imageUrls: {
    required: true,
    type: [{type: String}],
  },
  createdAt: {
    required: true,
    type: Number,
  },
  location: { type: { type: String, enum: ['Point'], default: 'Point' }, coordinates: { type: [{type: Number}], default: [0, 0] } }
});

PhotoZoneSchema.index({ location: "2dsphere" }); 

const PhotoZone = mongoose.model<DBPhotoZone>('PhotoZone', PhotoZoneSchema, 'photoZone');

export { PhotoZone, PhotoZoneSchema };
import mongoose, { Schema } from 'mongoose';

interface DBPhotoZone {
  // var _id: String
  // var creator: CreatorForList
  // var title: String
  // var placeName: String
  // var location: GuidelineLocation
  // var shortDescription: String
  // var description: String
  
  // var imageUrls: [String]
  // var tags: [String]
  uid: string;

  title: string;
  placeName: string;
  location: {
    type: string;
    coordinates: number[];
  };
  description: string;
  shortDescription: string;
  imageUrls: [string];
  tags: [string];
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
  title: {
    required: true,
    type: String,
  },
  shortDescription: {
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
  tags: { required: true, type: [String] },  
  location: { type: { type: String, enum: ['Point'], default: 'Point' }, coordinates: { type: [{type: Number}], default: [0, 0] } }
});

PhotoZoneSchema.index({ location: "2dsphere" }); 

const PhotoZone = mongoose.model<DBPhotoZone>('PhotoZone', PhotoZoneSchema, 'photoZone');

export { PhotoZone, PhotoZoneSchema };
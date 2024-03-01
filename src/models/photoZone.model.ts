import mongoose, { Schema, Document, Model } from 'mongoose';

interface DBPhotoZone {
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

interface DBPhotoZoneDocument extends DBPhotoZone, Document {

}

interface DBPhotoZoneModel extends Model<DBPhotoZoneDocument> {
  findByDistance(lat: number, lng: number, distance: number): Promise<DBPhotoZoneDocument[]>;
  searchByKeyword: (keyword: string) => Promise<[DBPhotoZoneDocument]>;
}  

const PhotoZoneSchema = new Schema<DBPhotoZoneDocument>({
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
  tags: { 
    required: true, 
    type: [String] 
  },  
  location: { 
    type: { 
      type: String, 
      enum: ['Point'], 
      default: 'Point' 
    }, 
    coordinates: { 
      type: [{type: Number}], 
      default: [0, 0] 
    } 
  }
});

PhotoZoneSchema.index({ location: "2dsphere" }); 

PhotoZoneSchema.statics.findByDistance = async function (lat: number, lng: number, distance: number) {
  const result = PhotoZone.find({
    location: {
      $near: {
        $maxDistance: distance,
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat],
        },
      },
    },
  })
  return result;
};

PhotoZoneSchema.statics.searchByKeyword = async function(keyword: string) {
  let result = await PhotoZone.aggregate([
    {
      $lookup: {
        from: "user",
        localField: "creatorUid",
        foreignField: "uid",
        as: "creator"
      }
    },
    {
      $unwind: "$creator"
    },
    {
      $match: {
        $or: [
          { placeName: { $regex: new RegExp(keyword, 'i') } },
          { title: { $regex: new RegExp(keyword, 'i') } },
          { description: { $regex: new RegExp(keyword, 'i') } },
          { shortDescription: { $regex: new RegExp(keyword, 'i') } },
          { tags: { $elemMatch: { $regex: keyword, $options: 'i' } } },
        ],
      }
    }
  ])
  return result;
}

const PhotoZone = mongoose.model<DBPhotoZoneDocument, DBPhotoZoneModel>("PhotoZone", PhotoZoneSchema, "photoZone");
export { PhotoZone, PhotoZoneSchema, DBPhotoZoneDocument };

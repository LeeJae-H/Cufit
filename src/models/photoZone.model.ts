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
  findByArea(coordinates: any[], code?: string): Promise<DBPhotoZoneDocument[]>;
  searchByKeyword: (keyword: string) => Promise<[DBPhotoZoneDocument]>;
  findAll: (page: number, code?: string) => Promise<[DBPhotoZoneDocument]>;
  getFromObjId: (_id: string) => Promise<DBPhotoZoneDocument>;
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
}, {
  toJSON: {
    virtuals: true
  },
  toObject: {
    virtuals: true
  
  }
});

PhotoZoneSchema.index({ location: "2dsphere" }); 

PhotoZoneSchema.statics.getFromObjId = async function(_id: string) {
  try {
    let pipeline = createInitialPipeline();

    pipeline.unshift( {
      $match: {
        $or: [
          { _id: new mongoose.Types.ObjectId(_id) } 
        ]
      }
    });

    let result = await PhotoZone.aggregate(pipeline);
    return result;  
    } catch(error) {
    throw error;
  }
}


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
  .populate("likedCount")
  .populate("viewCount")
  .populate("creator");
  
  return result;
};

PhotoZoneSchema.statics.findByArea = async function (coordinates: any[], code?: string) {
  let pipeline = createInitialPipeline();

  pipeline.unshift(
    {
      $match: {
        location: {
          $geoWithin: {
            $geometry: {
              type: "Polygon",
              coordinates: [coordinates]
            }
          }
        }
      }
    }
  )

  let result = await PhotoZone.aggregate(pipeline);

  return result;

};

PhotoZoneSchema.statics.searchByKeyword = async function(keyword: string) {
  let pipeline = createInitialPipeline();

  pipeline.unshift(
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
  )

  let result = await PhotoZone.aggregate(pipeline);

  return result;
}

PhotoZoneSchema.statics.findAll = async function(page: number, code?: string) {
  let pipeline = createInitialPipeline(code);
  // pipeline = pagination(pipeline, page);
  let result = await PhotoZone.aggregate(pipeline);

  return result;
}

PhotoZoneSchema.virtual('likedCount', {
  ref: 'Like',
  localField: '_id',
  foreignField: 'productId',
  count: true
});

PhotoZoneSchema.virtual('viewCount', {
  ref: 'ViewCount',
  localField: '_id',
  foreignField: 'productId',
  count: true
});


PhotoZoneSchema.virtual('creator', {
  ref: 'User',
  localField: 'uid',
  foreignField: 'uid',
  justOne: true
})

function pagination(pipeline: any[], page: number) {
  let pagination: any[] = [
    {
      $skip: (page - 1) * 20
    },
    {
      $limit: page
    }
  ];
  pipeline.push(pagination);
  return pipeline;
}

function createInitialPipeline(code?: string) {
  let pipeline: any[] = [
    {
      $lookup: {
        from: "user", 
        localField: "uid",
        foreignField: "uid", 
        as: "creator" 
      }
    },
    {
      $unwind: "$creator"
    },
    {
      $lookup: {
        from: "like",
        localField: "_id",
        foreignField: "productId",
        as: "likes"
      }
    },
    {
      $addFields: {
        likedCount: { $size: "$likes" } 
      }
    },
    {
      $lookup: {
        from: "viewCount",
        localField: "_id",
        foreignField: "productId",
        as: "views"
      }
    },
    {
      $addFields: {
        viewCount: { $size: "$views" } 
      }
    },
    {
      $project: {
        views: 0,
        likes: 0
      }
    }
  ];

  return pipeline;
}

const PhotoZone = mongoose.model<DBPhotoZoneDocument, DBPhotoZoneModel>("PhotoZone", PhotoZoneSchema, "photoZone");
export { PhotoZone, PhotoZoneSchema, DBPhotoZoneDocument };

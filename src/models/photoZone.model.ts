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
  .populate("creator");
  return result;
};

PhotoZoneSchema.statics.findByArea = async function (coordinates: any[], code?: string) {
// photozone에는 auth 컬렉션에 정보가 없어서 아래 주석처럼 하면 결과가 안나오는것 같음.
  // let pipeline = createInitialPipeline(code);

  // pipeline.unshift({
  //   $match: {
  //     location: {
  //       $geoWithin: {
  //         $geometry: {
  //           type: "Polygon",
  //           coordinates: [coordinates]
  //         }
  //       }
  //     }
  //   }
  // });
  // let result = await PhotoZone.aggregate(pipeline);
  // return result; 
  
  let result = await PhotoZone.aggregate([
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
  ]);
  return result;

};

PhotoZoneSchema.statics.searchByKeyword = async function(keyword: string) {
  let result = await PhotoZone.aggregate([
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

PhotoZoneSchema.virtual('likedCount', {
  ref: 'Like',
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

function createInitialPipeline(code?: string) {
  let pipeline: any[] = [
    {
      $lookup: {
        from: "auth",
        let: { productId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$productId", "$$productId"] }
            }
          }
        ],
        as: "authStatus"
      }
    },
    {
      $unwind: "$authStatus"
    },
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
        from: "order",
        localField: "_id",
        foreignField: "productId",
        as: "orders"
      }
    },
    {
      $addFields: {
        usedCount: { $size: "$orders" } 
      }
    },
    {
      $project: {
        orders: 0,
        likes: 0
      }
    }
  ];

  if (code) {
    if (code !== "all") {
      pipeline.splice(2, 0, {
        $match: {
          "authStatus.code": code
        }
      });
    }
  } else {
    pipeline.splice(2, 0, {
      $match: {
        "authStatus.code": "authorized"
      }
    });
  }

  return pipeline;
}

const PhotoZone = mongoose.model<DBPhotoZoneDocument, DBPhotoZoneModel>("PhotoZone", PhotoZoneSchema, "photoZone");
export { PhotoZone, PhotoZoneSchema, DBPhotoZoneDocument };

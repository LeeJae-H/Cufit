import mongoose, { Schema, Document, Model } from 'mongoose';
import { Like } from './like.model';
import * as order from './order.model';
import * as wish from './wish.model';
import * as user from './user.model';
import * as auth from './auth.model';
auth
user
order
wish

interface DBGuideline {
  title: string;
  tags: string[];
  description: string;
  shortDescription: string;
  createdAt: number;
  authStatus: object;
  originalImageUrl: string;
  guidelineImageUrl: string;
  credit: number;
  type: string;
  placeName?: string;
  creatorUid: string;
  likedCount: number;
  wishedCount: number;
  usedCount: number;
  location: {
    type: string;
    coordinates: number[];
  };
}

interface DBGuidelineDocument extends DBGuideline, Document {

}

interface DBGuidelineModel extends Model<DBGuidelineDocument> {
  getListFromCreatorUid: (uid: string, code?: string) => Promise<[DBGuidelineDocument]>;
  getListFromTag: (tag: string) => Promise<[DBGuidelineDocument]>;
  getFromObjId: (_id: string, code?: string) => Promise<DBGuidelineDocument>;
  newGuideline: (data: Object) => Promise<DBGuidelineDocument>;
  getListFromTagWithSort: (tag: string, sortBy: string, sort: string) => Promise<[DBGuidelineDocument]>;
  top5: (code?: string) => Promise<[DBGuidelineDocument]>;
  search: (keyword: string, sort: string, sortby: string, cost: string) => Promise<[DBGuidelineDocument]>;
  newSearch: (keyword: string, code?: string) => Promise<[DBGuidelineDocument]>;
  searchbyTitleOrTag: (keyword: string, code?: string) => Promise<[DBGuidelineDocument]>;
  findByDistance(lat: number, lng: number, distance: number, code?: string): Promise<DBGuidelineDocument[]>;
  findByArea(coordinates: any[], code?: string): Promise<DBGuidelineDocument[]>;
}

const GuidelineSchema = new Schema<DBGuidelineDocument>({
  title: { required: true, type: String },
  tags: { required: true, type: [String] },  
  description: { required: true, type: String },
  shortDescription: { required: true, type: String },
  createdAt: { required: true, type: Number },
  originalImageUrl: { required: true, type: String },
  guidelineImageUrl: { required: true, type: String },
  credit: { required: true, type: Number },
  type: { required: true, type: String, default: "Guideline" },
  placeName: { type: String },
  creatorUid: { required: true, type: String, ref: 'User' },
  location: { type: { type: String, enum: ['Point'], default: 'Point' }, coordinates: { type: [{type: Number}], default: [0, 0] } }
}, {
  toJSON: {
    virtuals: true
  },
  toObject: {
    virtuals: true
  }
})
/**
 * idToken -> verify middle
 * req -> uid?, code -> default -> authorized, all, code(selected) 
 * response로 나가야하는 guideline -> creator, authStatus, likedCount, usedCount
 * 
 */
GuidelineSchema.statics.getListFromCreatorUid = async function(uid: string, code?: string) {
  try {
    let pipeline = createInitialPipeline(code);

    pipeline.splice(4, 0, {
      $match: {
        $or: [
          { creatorUid: uid } 
        ]
      }
    });

    pipeline.push(
      {
        $sort: { _id: -1 } 
       },
      {
        $limit: 50 
      }
    );
  
    let result = await Guideline.aggregate(pipeline);
    return result;  
  } catch(error) {
    throw error;
  }
}

GuidelineSchema.statics.getListFromTag = async function(tag: string) {
  try {
    const result = await Guideline.find({ tags: { $elemMatch: { $regex: tag, $options: 'i' } } }).sort({ _id: -1 }).limit(50)
                    .populate('likedCount')
                    .populate('wishedCount')
                    .populate('usedCount')
                    .populate('authStatus')
                    .populate('creator');
    return result;
  } catch(error) {
    throw error;
  }
}

GuidelineSchema.statics.getFromObjId = async function(_id: string, code?: string) {
  try {
    let pipeline = createInitialPipeline(code);

    pipeline.unshift( {
      $match: {
        $or: [
          { _id: new mongoose.Types.ObjectId(_id) } 
        ]
      }
    });

    let result = await Guideline.aggregate(pipeline);
    return result;  
    } catch(error) {
    throw error;
  }
}

GuidelineSchema.statics.getListFromTagWithSort = async function(tag: string, sortBy: string, sort: string) {
  if (sortBy === "l") {
    return await getByLatest(tag, sort);
  } else if (sortBy === "p") {
    return await getByLikedCount(tag, sort);
  } else {
    return [];
  }
}

GuidelineSchema.statics.top5 = async function(code?: string) {
  try {
    let pipeline = createInitialPipeline(code);

    pipeline.push(
      {
        $sort: {
          likedCount: -1
        }
      },
      {
        $limit: 5
      }
    );
  
    let result = await Guideline.aggregate(pipeline);
    return result; 
  } catch (error) {
    console.error('Error getting top 5 guidelines by likes:', error);
    throw error;
  }
}

GuidelineSchema.statics.newSearch = async function(keyword: string, code?: string) {
  let pipeline = createInitialPipeline(code);

  pipeline.unshift({
    $match: {
      $or: [
        { tags: { $elemMatch: { $regex: keyword, $options: 'i' } } },
        { title: { $regex: new RegExp(keyword, 'i') } },
        { description: { $regex: new RegExp(keyword, 'i') } },
        { shortDescription: { $regex: new RegExp(keyword, 'i') } }
      ]
    }
  })

  let result = await Guideline.aggregate(pipeline);

  return result; 

}

GuidelineSchema.statics.searchbyTitleOrTag = async function(keyword: string, code?: string) {

  let pipeline = createInitialPipeline(code);
  
  pipeline.unshift({
    $match: {
      $or: [
        { tags: { $elemMatch: { $regex: keyword, $options: 'i' } } },
        { title: { $regex: new RegExp(keyword, 'i') } }
      ]
    }
  });

  let result = await Guideline.aggregate(pipeline);
  return result;  
}

GuidelineSchema.statics.search = async function(keyword: string, sort: string, sortby: string, cost: string) {
  if (sortby === "p") { // like순서
    let result = searchByLike(keyword, sort === "d", cost === "f")
    return result
  } else { // 최신순
    let result = searchByLatest(keyword, sort === "d", cost === "f")
    return result
  }
}

GuidelineSchema.statics.findByDistance = async function (lat: number, lng: number, distance: number, code?: string) {
  let pipeline = createInitialPipeline(code);

  pipeline.unshift({
    $geoNear: {
      near: {
          type: "Point",
          coordinates: [lng, lat]
      },
      distanceField: "distance",
      maxDistance: distance,
      spherical: true
    }
  });
    
  let result = await Guideline.aggregate(pipeline);
  return result;  
};


GuidelineSchema.statics.findByArea = async function (coordinates: any[], code?: string) {
  let pipeline = createInitialPipeline(code);

  pipeline.unshift({
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
  });
    
  let result = await Guideline.aggregate(pipeline);
  return result;  
};

GuidelineSchema.virtual('likedCount', {
  ref: 'Like',
  localField: '_id',
  foreignField: 'productId',
  count: true
});

GuidelineSchema.virtual('wishedCount', {
  ref: 'Wish',
  localField: '_id',
  foreignField: 'productId',
  count: true
});

GuidelineSchema.virtual('usedCount', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'productId',
  count: true
});

GuidelineSchema.virtual('creator', {
  ref: 'User',
  localField: 'creatorUid',
  foreignField: 'uid',
  justOne: true
})

GuidelineSchema.virtual('authStatus', {
  ref: 'Auth',
  localField: '_id',
  foreignField: 'productId',
  justOne: true
})
 
GuidelineSchema.index({ location: "2dsphere" }); 

async function searchByLatest(keyword: string, desc: boolean, isFree: boolean) {
  try {
    const filtered = await Guideline.aggregate([
      {
        $lookup: {
          from: "auth",
          localField: "_id",
          foreignField: "productId",
          as: "authStatus"
        }
      },
      {
        $unwind: "$authStatus"
      },
      {
        $match: {
          'authStatus.code': "authorized",
          $or: [
            { tags: { $elemMatch: { $regex: keyword, $options: 'i' } } },
            { title: { $regex: new RegExp(keyword, 'i') } },
            { description: { $regex: new RegExp(keyword, 'i') } },
            { shortDescription: { $regex: new RegExp(keyword, 'i') } },
          ],
          credit: isFree ?
            { $eq: 0 } :
            { $gt: 0 }
        }
      },
      {
        $sort: {
          _id: desc ? -1 : 1
        }
      },
      {
        $limit: 100
      }
    ]);
    const filteredIds = filtered.map(item => item._id).reverse();
    const result = await Guideline.find({ _id: filteredIds })
      .populate('likedCount')
      .populate('wishedCount')
      .populate('usedCount')
      .populate('authStatus')
      .populate('creator');
    console.log('result')
    console.log(result)
    return result;
  } catch (error) {
    console.error('Error getting top 5 guidelines by likes:', error);
    throw error;
  }
}

async function searchByLike(keyword: string, desc: boolean, isFree: boolean) {
  try {
    const filtered = await Guideline.aggregate([
      {
        $lookup: {
          from: "auth",
          localField: "_id",
          foreignField: "productId",
          as: "authStatus"
        }
      },
      {
        $unwind: "$authStatus"
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
        $match: {
          'authStatus.code': "authorized",
          $or: [
            { tags: { $elemMatch: { $regex: keyword, $options: 'i' } } },
            { title: { $regex: new RegExp(keyword, 'i') } },
            { description: { $regex: new RegExp(keyword, 'i') } },
            { shortDescription: { $regex: new RegExp(keyword, 'i') } },
          ],
          credit: isFree ?
            { $eq: 0 } :
            { $gt: 0 }
        }
      },
      {
        $project: {
          likedCount: { $size: "$likes" }
        }
      },
      {
        $sort: {
          likedCount: desc ? -1 : 1
        }
      },
      {
        $limit: 100
      }
    ]);
    const filteredIds = filtered.map(item => item._id).reverse();
    const result = await Guideline.find({ _id: filteredIds })
      .populate('likedCount')
      .populate('wishedCount')
      .populate('usedCount')
      .populate('authStatus')
      .populate('creator');
    console.log('result')
    console.log(result)
    return result;
  } catch (error) {
    console.error('Error getting top 5 guidelines by likes:', error);
    throw error;
  }
}

async function getByLikedCount(tag: string, sort: string) {
  try {
    const filtered = await Guideline.aggregate([
      {
        $lookup: {
          from: "auth",
          localField: "_id",
          foreignField: "productId",
          as: "authStatus"
        }
      },
      {
        $unwind: "$authStatus"
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
        $match: {
          'authStatus.code': "authorized",
          tags: { $elemMatch: { $regex: tag, $options: 'i' } }
        }
      },
      {
        $project: {
          likedCount: { $size: "$likes" }
        }
      },
      {
        $sort: {
          likedCount: sort === "a" ? 1 : -1
        }
      },
      {
        $limit: 20
      }
    ]);
    const filteredIds = filtered.map(item => item._id).reverse();
    const result = await Guideline.find({ _id: filteredIds })
      .populate('likedCount')
      .populate('wishedCount')
      .populate('usedCount')
      .populate('authStatus')
      .populate('creator');
    console.log('result')
    console.log(result)
    return result;
  } catch (error) {
    console.error('Error getting top 5 guidelines by likes:', error);
    throw error;
  }
}

async function getByLatest(tag: string, sort: string) {
  try {
    const filtered = await Guideline.aggregate([
      {
        $lookup: {
          from: "auth",
          localField: "_id",
          foreignField: "productId",
          as: "authStatus"
        }
      },
      {
        $unwind: "$authStatus"
      },
      {
        $match: {
          'authStatus.code': "authorized",
          tags: { $elemMatch: { $regex: tag, $options: 'i' } }
        }
      },
      {
        $sort: {
          _id: sort === "a" ? 1 : -1
        }
      },
      {
        $limit: 20
      }
    ]);
    const filteredIds = filtered.map(item => item._id).reverse();
    const result = await Guideline.find({ _id: filteredIds })
      .populate('likedCount')
      .populate('wishedCount')
      .populate('usedCount')
      .populate('authStatus')
      .populate('creator');
    console.log('result')
    console.log(result)
    return result;
  } catch (error) {
    console.error('Error getting top 5 guidelines by likes:', error);
    throw error;
  }
}

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
        orders: 0, // likes 필드를 제외하고 출력
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

const Guideline = mongoose.model<DBGuidelineDocument, DBGuidelineModel>("Guideline", GuidelineSchema, "guideline");
export { Guideline, GuidelineSchema, DBGuidelineDocument };

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
  getListFromCreatorUid: (uid: string) => Promise<[DBGuidelineDocument]>;
  getListFromTag: (tag: string) => Promise<[DBGuidelineDocument]>;
  getFromObjId: (_id: string) => Promise<DBGuidelineDocument>;
  newGuideline: (data: Object) => Promise<DBGuidelineDocument>;
  getListFromTagWithSort: (tag: string, sortBy: string, sort: string) => Promise<[DBGuidelineDocument]>;
  top5: () => Promise<[DBGuidelineDocument]>;
  search: (keyword: string, sort: string, sortby: string, cost: string) => Promise<[DBGuidelineDocument]>;
  newSearch: (keyword: string) => Promise<[DBGuidelineDocument]>;
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

GuidelineSchema.statics.getListFromCreatorUid = async function(uid: string) {
  try {
    const result = await Guideline.find({ creatorUid: uid }).sort({ _id: -1 }).limit(50)
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

GuidelineSchema.statics.getFromObjId = async function(_id: string) {
  try {
    const result = await Guideline.findById(_id)
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

GuidelineSchema.statics.getListFromTagWithSort = async function(tag: string, sortBy: string, sort: string) {
  if (sortBy === "l") {
    return await getByLatest(tag, sort);
  } else if (sortBy === "p") {
    return await getByLikedCount(tag, sort);
  } else {
    return [];
  }
}

GuidelineSchema.statics.top5 = async function() {
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
          'authStatus.code': "authorized"
        }
      },
      {
        $project: {
          likedCount: { $size: "$likes" }
        }
      },
      {
        $sort: {
          likedCount: -1
        }
      },
      {
        $limit: 5
      }
    ]);
    const filteredIds = filtered.map(item => item._id).reverse();
    const top5Guidelines = await Guideline.find({ _id: filteredIds })
      .populate('likedCount')
      .populate('wishedCount')
      .populate('usedCount')
      .populate('authStatus')
      .populate('creator');
    console.log('result')
    console.log(top5Guidelines)
    top5Guidelines.sort((a, b): number => {
      return b.likedCount - a.likedCount;
    });
    return top5Guidelines;
  } catch (error) {
    console.error('Error getting top 5 guidelines by likes:', error);
    throw error;
  }
}

GuidelineSchema.statics.newSearch = async function(keyword: string) {
  let result = await Guideline.aggregate([
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
        "authStatus.code": "authorized",
        $or: [
          { tags: { $elemMatch: { $regex: keyword, $options: 'i' } } },
          { title: { $regex: new RegExp(keyword, 'i') } },
          { description: { $regex: new RegExp(keyword, 'i') } },
          { shortDescription: { $regex: new RegExp(keyword, 'i') } },
        ],
      }
    }
  ])
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

const Guideline = mongoose.model<DBGuidelineDocument, DBGuidelineModel>("Guideline", GuidelineSchema, "guideline");
export { Guideline, GuidelineSchema };

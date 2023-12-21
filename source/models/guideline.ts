import mongoose, { Schema, Document, Model } from 'mongoose';
import { Like } from './like';
import * as order from './order';
import * as wish from './wish';
import * as user from './user';
import * as auth from './auth';
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
  let query = Guideline.find({ tags: { $elemMatch: { $regex: tag, $options: 'i' } } })
  if (sortBy === "l") {
    if (sort === "a") {
      return await query.sort({ _id : -1 }).limit(20)
                    .populate('likedCount')
                    .populate('wishedCount')
                    .populate('usedCount')
                    .populate('authStatus')
                    .populate('creator');
    } else {
      return await query.sort({ _id : 1 }).limit(20)
                    .populate('likedCount')
                    .populate('wishedCount')
                    .populate('usedCount')
                    .populate('authStatus')
                    .populate('creator');
    }
  } else if (sortBy === "p") {
    if (sort === "a") {
      return await query.sort({ likedCount : -1 }).limit(20)
                    .populate('likedCount')
                    .populate('wishedCount')
                    .populate('usedCount')
                    .populate('authStatus')
                    .populate('creator');
    } else {
      return await query.sort({ likedCount: 1 }).limit(20)
                    .populate('likedCount')
                    .populate('wishedCount')
                    .populate('usedCount')
                    .populate('authStatus')
                    .populate('creator');
    }
  } else {
    return [];
  }
}

GuidelineSchema.statics.top5 = async function() {
  try {
    const top5Guidelines = await Like.aggregate([
      {
        $match: { productType: 'Guideline' }
      },
      {
        $group: {
          _id: '$productId',
          likeCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'guideline', // 'guidelines'는 실제 Guideline 컬렉션의 이름입니다.
          localField: '_id',
          foreignField: '_id',
          as: 'guideline'
        }
      },
      {
        $unwind: { path: '$guideline', preserveNullAndEmptyArrays: true }
      },
      {
        $sort: { likeCount: -1 }
      },
      {
        $limit: 5
      },
      {
        $project: {
          _id: '$guideline._id'
        }
      }
    ]);

    const guidelineIds = top5Guidelines.map((item) => item._id);

    // Guideline 모델에서 상위 5개 Guideline을 가져오기
    let top5GuidelineDocuments = await Guideline.find({ _id: { $in: guidelineIds } })
      .populate('likedCount')
      .populate('wishedCount')
      .populate('usedCount')
      .populate('authStatus')
      .populate('creator');
    if (top5GuidelineDocuments.length < 5) {
      const additional = await Guideline.find().sort({ _id: -1 })
        .limit(5 - top5GuidelineDocuments.length)
        .populate('likedCount')
        .populate('wishedCount')
        .populate('usedCount')
        .populate('authStatus')
        .populate('creator');
        additional.forEach(item => {
          top5GuidelineDocuments.push(item);
        })
    }
    return top5GuidelineDocuments;
  } catch (error) {
    console.error('Error getting top 5 guidelines by likes:', error);
    throw error;
  }
}

GuidelineSchema.statics.newSearch = async function(keyword: string) {
  let result = await Guideline.aggregate([
    {
      $match: {
        // authStatus: {
        //   $match: {
        //     code: "authorized"
        //   }
        // },
        $or: [
          { tags: { $elemMatch: { $regex: keyword, $options: 'i' } } },
          { title: { $regex: new RegExp(keyword, 'i') } },
          { description: { $regex: new RegExp(keyword, 'i') } },
          { shortDescription: { $regex: new RegExp(keyword, 'i') } },
        ],
      }
    }
  ])
  // let result = await Guideline.find({
  //   $or: [
  //     { tags: { $elemMatch: { $regex: keyword, $options: 'i' } } },
  //     { title: { $regex: new RegExp(keyword, 'i') } },
  //     { description: { $regex: new RegExp(keyword, 'i') } },
  //     { shortDescription: { $regex: new RegExp(keyword, 'i') } },
  //   ],
  // })
  return result;
}


GuidelineSchema.statics.search = async function(keyword: string, sort: string, sortby: string, cost: string) {
  if (sortby === "p") { // like순서
    let result = searchByLike(keyword, sort === "d", cost === "f")
    return result
  } else { // 최신순
    let result = await Guideline.find({
      $or: [
        { tags: { $elemMatch: { $regex: keyword, $options: 'i' } } },
        { title: { $regex: new RegExp(keyword, 'i') } },
        { description: { $regex: new RegExp(keyword, 'i') } },
        { shortDescription: { $regex: new RegExp(keyword, 'i') } },
      ],
      credit: cost === "f" ?
      { $eq: 0 } :
      { $gt: 0 }
    })
    .sort({ _id: sort === "d" ? -1 : 1 })
    .populate('likedCount')
    .populate('wishedCount')
    .populate('usedCount')
    .populate('authStatus')
    .populate('creator');
    return result;
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

async function searchByLike(keyword: string, desc: boolean, isFree: boolean) {
  let result = await Like.aggregate([
    {
      $match: {
        productType: "Guideline"
      },
    },
    {
      $group: {
        _id: '$productId',
        likedCount: { $sum: 1 },
      }
    },
    {
      $lookup: {
        from: "filter",
        localField: "_id",
        foreignField: "_id",
        as: "filterData",
      }
    },
    {
      $unwind: {
        path: '$filterData',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: '$filterData._id',
        tags: '$filterData.tags',
        title: '$filterData.title',
        description: '$filterData.description',
        shortDescription: '$filterData.shortDescription',
        credit: '$filterData.credit'
      }
    },
    {
      $match: {
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
      $sort: { likedCount: desc ? -1 : 1 }
    }
  ])

  const guidelineIds = result.map(item => item._id);
  const guidelines = await Guideline.find({ _id: { $in: guidelineIds } })
  .populate('likedCount')
  .populate('wishedCount')
  .populate('usedCount')
  .populate('creator');
  return guidelines;
}


const Guideline = mongoose.model<DBGuidelineDocument, DBGuidelineModel>("Guideline", GuidelineSchema, "guideline");
export { Guideline, GuidelineSchema };

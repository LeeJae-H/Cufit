import mongoose, { Schema, Document, Model } from 'mongoose';
import { Like } from './like';
import * as order from './order';
import * as wish from './wish';
import * as user from './user';
user
order
wish

interface DBGuideline {
  title: string;
  tags: string[];
  description: string;
  shortDescription: string;
  createdAt: number;
  authStatus: string;
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

interface DBDBGuidelineDocument extends DBGuideline, Document {

}

interface DBGuidelineModel extends Model<DBDBGuidelineDocument> {
  getListFromCreatorUid: (uid: string, auth: string) => Promise<[DBDBGuidelineDocument]>;
  getListFromTag: (tag: string, auth: string) => Promise<[DBDBGuidelineDocument]>;
  getFromObjId: (_id: string) => Promise<DBDBGuidelineDocument>;
  newGuideline: (data: Object) => Promise<DBDBGuidelineDocument>;
  getListFromTagWithSort: (tag: string, sortBy: string, sort: string, auth: string) => Promise<[DBDBGuidelineDocument]>;
  top5: () => Promise<[DBDBGuidelineDocument]>;
  search: (keyword: string, sort: string, sortby: string, cost: string) => Promise<[DBDBGuidelineDocument]>;
}

const GuidelineSchema = new Schema<DBDBGuidelineDocument>({
  title: { required: true, type: String },
  tags: { required: true, type: [String] },  
  description: { required: true, type: String },
  shortDescription: { required: true, type: String },
  createdAt: { required: true, type: Number },
  authStatus: { required: true, type: String },
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

GuidelineSchema.statics.getListFromCreatorUid = async function(uid: string, auth: string) {
  try {
    if (auth === "all") {
      const result = await Guideline.find({ creatorUid: uid }).sort({ _id: -1 }).limit(50)
        .populate('likedCount')
        .populate('wishedCount')
        .populate('usedCount')
        .populate('creator');
      return result;
    } else {
      const result = await Guideline.find({ creatorUid: uid, authStatus: auth }).sort({ _id: -1 }).limit(50)
        .populate('likedCount')
        .populate('wishedCount')
        .populate('usedCount')
        .populate('creator');
      return result;
    }
    
    
  } catch(error) {
    throw error;
  }
}

GuidelineSchema.statics.getListFromTag = async function(tag: string, auth: string) {
  try {
    const result = await Guideline.find({ tags: { $elemMatch: { $regex: tag, $options: 'i' } }, authStatus: auth }).sort({ _id: -1 }).limit(50)
                    .populate('likedCount')
                    .populate('wishedCount')
                    .populate('usedCount')
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
                    .populate('creator');
    return result;
  } catch(error) {
    throw error;
  }
}

GuidelineSchema.statics.getListFromTagWithSort = async function(tag: string, sortBy: string, sort: string, auth: string) {
  let query = Guideline.find({ tags: { $elemMatch: { $regex: tag, $options: 'i' } }, authStatus: auth })
  if (sortBy === "l") {
    if (sort === "a") {
      return await query.sort({ _id : -1 }).limit(20)
                    .populate('likedCount')
                    .populate('wishedCount')
                    .populate('usedCount')
                    .populate('creator');
    } else {
      return await query.sort({ _id : 1 }).limit(20)
                    .populate('likedCount')
                    .populate('wishedCount')
                    .populate('usedCount')
                    .populate('creator');
    }
  } else if (sortBy === "p") {
    if (sort === "a") {
      return await query.sort({ likedCount : -1 }).limit(20)
                    .populate('likedCount')
                    .populate('wishedCount')
                    .populate('usedCount')
                    .populate('creator');
    } else {
      return await query.sort({ likedCount: 1 }).limit(20)
                    .populate('likedCount')
                    .populate('wishedCount')
                    .populate('usedCount')
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
      .populate('creator');
    if (top5GuidelineDocuments.length < 5) {
      const additional = await Guideline.find().sort({ _id: -1 })
        .limit(5 - top5GuidelineDocuments.length)
        .populate('likedCount')
        .populate('wishedCount')
        .populate('usedCount')
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
      { $gt: 0 },
      authStatus: "authorized"
    })
    .sort({ _id: sort === "d" ? -1 : 1 })
    .populate('likedCount')
    .populate('wishedCount')
    .populate('usedCount')
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
        credit: '$filterData.credit',
        authStatus: '$filterData.authStatus'
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
          { $gt: 0 },
        authStatus: "authorized"
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


const Guideline = mongoose.model<DBDBGuidelineDocument, DBGuidelineModel>("Guideline", GuidelineSchema, "guideline");
export { Guideline, GuidelineSchema };

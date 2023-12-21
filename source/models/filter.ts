import mongoose, { Schema, Document, Model } from 'mongoose';
import { Like } from './like';
import * as order from './order';
import * as wish from './wish';
import * as user from './user';
user
order
wish

interface DBFilter {
  title: string;
  tags: string[];
  description: string;
  shortDescription: string;
  createdAt: number;
  authStatus: object;
  originalImageUrl: string;
  filteredImageUrl: string;
  credit: number;
  type: string;
  creatorUid: string;
  adjustment: object;
}

interface DBFilterDocument extends DBFilter, Document {

}

interface DBFilterModel extends Model<DBFilterDocument> {
  getListFromCreatorUid: (uid: string) => Promise<[DBFilterDocument]>;
  getListFromCreatorId: (cid: string) => Promise<[DBFilterDocument]>;
  getListFromTag: (tag: string) => Promise<[DBFilterDocument]>;
  getListFromTagWithSort: (tag: string, sortBy: string, sort: string) => Promise<[DBFilterDocument]>;
  getFromObjId: (_id: string) => Promise<DBFilterDocument>;
  newFilter: (data: Object) => Promise<DBFilterDocument>;
  top5: () => Promise<[DBFilterDocument]>;
  search: (keyword: string, sort: string, sortby: string, cost: string) => Promise<[DBFilterDocument]>;
}

const FilterSchema = new Schema<DBFilterDocument>({
  title: { required: true, type: String },
  tags: { required: true, type: [String] },
  description: { required: true, type: String },
  shortDescription: { required: true, type: String },
  createdAt: { required: true, type: Number },
  originalImageUrl: { required: true, type: String },
  filteredImageUrl: { required: true, type: String },
  credit: { required: true, type: Number },
  type: { required: true, type: String, default: "Filter" },
  creatorUid: { required: true, type: String, ref: 'User' },
  adjustment: { required: true, type: Object },
}, {
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
});

FilterSchema.statics.getListFromCreatorUid = async function(uid: string) {
  try {
    const result = await Filter.find({ creatorUid: uid }).sort({ _id: -1 }).limit(50)
      .populate('likedCount')
      .populate('wishedCount')
      .populate('usedCount')
      .populate('creator');
      return result;
  } catch(error) {
    throw error;
  }
}

FilterSchema.statics.getListFromCreatorId = async function(cid: string) {
  try {
    const result = await Filter.find({ creatorId: cid }).sort({ _id: -1 }).limit(50)
    .populate('likedCount')
    .populate('wishedCount')
    .populate('usedCount')
    .populate('creator');
    return result;
  } catch(error) {
    throw error;
  }
}

FilterSchema.statics.getListFromTag = async function(tag: string) {
  try {
    const result = await Filter.find({ tags: { $elemMatch: { $regex: tag, $options: 'i' } } }).sort({ _id: -1 }).limit(50)
    .populate('likedCount')
    .populate('wishedCount')
    .populate('usedCount')
    .populate('creator');
    return result;
  } catch(error) {
    throw error;
  }
}


FilterSchema.statics.getListFromTagWithSort = async function(tag: string, sortBy: string, sort: string) {
  let query = Filter.find({ tags: { $elemMatch: { $regex: tag, $options: 'i' } } })
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

FilterSchema.statics.getFromObjId = async function(_id: string) {
  try {
    const result = await Filter.findById(_id)
    .populate('likedCount')
    .populate('wishedCount')
    .populate('usedCount')
    .populate('creator');
    return result;
  } catch(error) {
    throw error;
  }
}

FilterSchema.statics.search = async function(keyword: string, sort: string, sortby: string, cost: string) {
  if (sortby === "p") { // like순서
    let result = searchByLike(keyword, sort === "d", cost === "f")
    return result
  } else { // 최신순
    let result = await Filter.find({
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
    .populate('creator');
    return result;
  }
}

FilterSchema.statics.top5 = async function() {
  try {
    const top5Filters = await Like.aggregate([
      {
        $match: { productType: 'Filter' }
      },
      {
        $group: {
          _id: '$productId',
          likeCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'filter', // 'guidelines'는 실제 Guideline 컬렉션의 이름입니다.
          localField: '_id',
          foreignField: '_id',
          as: 'filter'
        }
      },
      {
        $unwind: { path: '$filter', preserveNullAndEmptyArrays: true }
      },
      {
        $sort: { likeCount: -1 }
      },
      {
        $limit: 5
      },
      {
        $project: {
          _id: '$filter._id'
        }
      }
    ]);

    const filterIds = top5Filters.map((item) => item._id);

    const top5FilterDocuments = await Filter.find({ _id: { $in: filterIds } })
      .populate('likedCount')
      .populate('wishedCount')
      .populate('usedCount')
      .populate('creator');
    if (top5FilterDocuments.length < 5) {
        const additional = await Filter.find().sort({ _id: -1 })
          .limit(5 - top5FilterDocuments.length)
          .populate('likedCount')
          .populate('wishedCount')
          .populate('usedCount')
          .populate('creator');
          additional.forEach(item => {
            top5FilterDocuments.push(item);
          })
      }
    return top5FilterDocuments;
  } catch (error) {
    console.error('Error getting top 5 guidelines by likes:', error);
    throw error;
  }
}


FilterSchema.virtual('likedCount', {
  ref: 'Like',
  localField: '_id',
  foreignField: 'productId',
  count: true
});

FilterSchema.virtual('wishedCount', {
  ref: 'Wish',
  localField: '_id',
  foreignField: 'productId',
  count: true
});

FilterSchema.virtual('usedCount', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'productId',
  count: true
});

FilterSchema.virtual('creator', {
  ref: 'User',
  localField: 'creatorUid',
  foreignField: 'uid',
  justOne: true
})

async function searchByLike(keyword: string, desc: boolean, isFree: boolean) {
  let result = await Like.aggregate([
    {
      $match: {
        productType: "Filter"
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

  const filterIds = result.map(item => item._id);
  const filters = await Filter.find({ _id: { $in: filterIds } })
  .populate('likedCount')
  .populate('wishedCount')
  .populate('usedCount')
  .populate('creator');
  return filters;
}

const Filter = mongoose.model<DBFilterDocument, DBFilterModel>("Filter", FilterSchema, "filter");
export { Filter, FilterSchema };
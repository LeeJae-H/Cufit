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
  authStatus: string;
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
  getListFromCreatorUid: (uid: string, auth: string) => Promise<[DBFilterDocument]>;
  getListFromCreatorId: (cid: string, auth: string) => Promise<[DBFilterDocument]>;
  getListFromTag: (tag: string, auth: string) => Promise<[DBFilterDocument]>;
  getListFromTagWithSort: (tag: string, sortBy: string, sort: string, auth: string) => Promise<[DBFilterDocument]>;
  getFromObjId: (_id: string) => Promise<DBFilterDocument>;
  newFilter: (data: Object) => Promise<DBFilterDocument>;
  top5: () => Promise<[DBFilterDocument]>;
}

const FilterSchema = new Schema<DBFilterDocument>({
  title: { required: true, type: String },
  tags: { required: true, type: [String] },
  description: { required: true, type: String },
  shortDescription: { required: true, type: String },
  createdAt: { required: true, type: Number },
  authStatus: { required: true, type: String },
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

FilterSchema.statics.getListFromCreatorUid = async function(uid: string, auth: string) {
  try {
    const result = await Filter.find({ creatorUid: uid, authStatus: auth }).sort({ _id: -1 }).limit(50)
    .populate('likedCount')
    .populate('wishedCount')
    .populate('usedCount')
    .populate('creator');
    return result;
  } catch(error) {
    throw error;
  }
}

FilterSchema.statics.getListFromCreatorId = async function(cid: string, auth: string) {
  try {
    const result = await Filter.find({ creatorId: cid, authStatus: auth }).sort({ _id: -1 }).limit(50)
    .populate('likedCount')
    .populate('wishedCount')
    .populate('usedCount')
    .populate('creator');
    return result;
  } catch(error) {
    throw error;
  }
}

FilterSchema.statics.getListFromTag = async function(tag: string, auth: string) {
  try {
    const result = await Filter.find({ tags: { $elemMatch: { $regex: tag, $options: 'i' } }, authStatus: auth }).sort({ _id: -1 }).limit(50)
    .populate('likedCount')
    .populate('wishedCount')
    .populate('usedCount')
    .populate('creator');
    return result;
  } catch(error) {
    throw error;
  }
}


FilterSchema.statics.getListFromTagWithSort = async function(tag: string, sortBy: string, sort: string, auth: string) {
  let query = Filter.find({ tags: { $elemMatch: { $regex: tag, $options: 'i' } }, authStatus: auth })
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

const Filter = mongoose.model<DBFilterDocument, DBFilterModel>("Filter", FilterSchema, "filter");
export { Filter, FilterSchema };
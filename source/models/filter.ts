import mongoose, { Schema, Document, Model } from 'mongoose';
import * as like from './like';
import * as order from './order';
import * as wish from './wish';
like
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
  creatorDisplayName: string;
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
  creatorUid: { required: true, type: String },
  creatorDisplayName: { required: true, type: String },
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
    .populate('usedCount');
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
    .populate('usedCount');
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
    .populate('usedCount');
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
      .populate('usedCount');
    } else {
      return await query.sort({ _id : 1 }).limit(20)
      .populate('likedCount')
      .populate('wishedCount')
      .populate('usedCount');
    }
  } else if (sortBy === "p") {
    if (sort === "a") {
      return await query.sort({ likedCount : -1 }).limit(20)
      .populate('likedCount')
      .populate('wishedCount')
      .populate('usedCount');
    } else {
      return await query.sort({ likedCount: 1 }).limit(20)
      .populate('likedCount')
      .populate('wishedCount')
      .populate('usedCount');
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
    .populate('usedCount');
    return result;
  } catch(error) {
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

const Filter = mongoose.model<DBFilterDocument, DBFilterModel>("Filter", FilterSchema, "filter");
export { Filter, FilterSchema };
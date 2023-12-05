import mongoose, { Schema, Document, Model } from 'mongoose';
import * as like from './like';
import * as order from './order';
import * as wish from './wish';
like
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
  creatorDisplayName: string;
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
  creatorUid: { required: true, type: String },
  creatorDisplayName: { required: true, type: String },
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
    const result = await Guideline.find({ creatorUid: uid, authStatus: auth }).sort({ _id: -1 }).limit(50)
                    .populate('likedCount')
                    .populate('wishedCount')
                    .populate('usedCount');
    return result;
  } catch(error) {
    throw error;
  }
}

GuidelineSchema.statics.getListFromTag = async function(tag: string, auth: string) {
  try {
    const result = await Guideline.find({ tags: { $elemMatch: { $regex: tag, $options: 'i' } }, authStatus: auth }).sort({ _id: -1 }).limit(50)
                    .populate('likedCount')
                    .populate('wishedCount')
                    .populate('usedCount');
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
                    .populate('usedCount');
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

GuidelineSchema.index({ location: "2dsphere" }); 

const Guideline = mongoose.model<DBDBGuidelineDocument, DBGuidelineModel>("Guideline", GuidelineSchema, "guideline");
export { Guideline, GuidelineSchema };

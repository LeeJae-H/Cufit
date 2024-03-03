import mongoose, { Schema, Document, Model } from 'mongoose';
import { Filter, DBFilterDocument } from './filter.model';
import { Guideline, DBGuidelineDocument } from './guideline.model';

interface DBLike {
  uid: string;
  productId: mongoose.Schema.Types.ObjectId;
  createdAt: number;
  productType: string;
}


interface DBLikeDocument extends DBLike, Document {

}

interface DBLikeModel extends Model<DBLikeDocument> {
  isExist: (pid: string, uid: string, type?: string) => Promise<Boolean>;
  getLikelist: (uid: string) => Promise<{ filters: DBFilterDocument[], guidelines: DBGuidelineDocument[] }>;
}


const LikeSchema = new Schema<DBLikeDocument>({
  uid: {
    required: true,
    type: String,
  },
  productId: {
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'productType'
  },
  createdAt: {
    required: true,
    type: Number
  },
  productType: {
    required: true,
    type: String,
    enum: ['Filter', 'Guideline', 'PhotoZone']
  }
})

LikeSchema.statics.isExist = async function(pid: string, uid: string, type?: string) {
  const result = await Like.findOne({ 
    productId: new mongoose.Types.ObjectId(pid), 
    uid: uid, 
    productType: type 
  })
  if(result) {
    return true
  } else {
    return false
  }
}

LikeSchema.statics.getLikelist = async function (uid: string) {
  try {
    const likelist = await Like.find({ uid: uid });
    const filterIds = likelist
    .filter((like: DBLikeDocument) => like.productType === "Filter")
    .map((like: DBLikeDocument) => like.productId);    
    
    const guidelineIds = likelist
    .filter((like: DBLikeDocument) => like.productType === "Guideline")
    .map((like: DBLikeDocument) => like.productId); 

    const filters = await Filter.find({ _id: { $in: filterIds } })
      .populate('likedCount')
      .populate('wishedCount')
      .populate('usedCount')
      .populate('authStatus')
      .populate('creator');

    const guidelines = await Guideline.find({ _id: { $in: guidelineIds } })
      .populate('likedCount')
      .populate('wishedCount')
      .populate('usedCount')
      .populate('authStatus')
      .populate('creator');

    return { filters, guidelines };
  } catch (error) {
    console.error('Error in getLikelistByUid:', error);
    throw error;
  }
};

const Like = mongoose.model<DBLikeDocument, DBLikeModel>('Like', LikeSchema, 'like')
export { Like, LikeSchema };
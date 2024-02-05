import mongoose, { Schema, Document, Model } from 'mongoose';
import { Filter, DBFilterDocument } from './filter.model';
import { Guideline, DBGuidelineDocument } from './guideline.model';

interface DBWish {
  uid: string;
  productId: mongoose.Schema.Types.ObjectId;
  createdAt: number;
  productType: string;
}

interface DBWishDocument extends DBWish, Document {

}

interface DBWishModel extends Model<DBWishDocument> {
  isExist: (pid: string, uid: string, type?: string) => Promise<Boolean>;
  getWishlist: (uid: string) => Promise<{ filters: DBFilterDocument[], guidelines: DBGuidelineDocument[] }>;
}

const WishSchema: Schema<DBWishDocument> = new Schema({
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
    type: Number,
  },
  productType: {
    required: true,
    type: String,
    enum: ['Filter', 'Guideline']
  }
});

WishSchema.statics.isExist = async function(pid: string, uid: string, type?: string) {
  const result = await Wish.findOne({ productId: pid, uid: uid, productType: type })
  if(result) {
    return true
  } else {
    return false
  }
}

WishSchema.statics.getWishlist = async function (uid: string) {
  try {
    const wishlist = await Wish.find({ uid: uid });
    const filterIds = wishlist
    .filter((wish: DBWishDocument) => wish.productType === "Filter")
    .map((wish: DBWishDocument) => wish.productId);    
    
    const guidelineIds = wishlist
    .filter((wish: DBWishDocument) => wish.productType === "Guideline")
    .map((wish: DBWishDocument) => wish.productId); 

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
    console.error('Error in getWishlistByUid:', error);
    throw error;
  }
};

const Wish = mongoose.model<DBWishDocument, DBWishModel>('Wish', WishSchema, 'wish');

export { Wish, WishSchema };
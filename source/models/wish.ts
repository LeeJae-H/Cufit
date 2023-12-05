import mongoose, { Schema, Document, Model } from 'mongoose';

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

const Wish = mongoose.model<DBWishDocument, DBWishModel>('Wish', WishSchema, 'wish');

export { Wish, WishSchema };
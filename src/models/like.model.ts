import mongoose, { Schema, Document, Model } from 'mongoose';

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
    enum: ['Filter', 'Guideline']
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

const Like = mongoose.model<DBLikeDocument, DBLikeModel>('Like', LikeSchema, 'like')
export { Like, LikeSchema };
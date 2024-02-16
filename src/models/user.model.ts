import mongoose, { Schema, Document, Model } from 'mongoose';
import { DecodedIdToken } from 'firebase-admin/auth';
import { Credit } from './credit.model';
import { Follow } from './follow.model';
import { Filter } from './filter.model';
import { Guideline } from './guideline.model';
import { Order } from './order.model';
Follow


interface DBUser {
  uid: string;
  email?: string;
  displayName: string;
  photoURL?: string;
  bio: string;
  signupDate: number;
  instagramName?: string;
  tiktokName?: string;
  youtubeName?: string;
  credit?: number;
  filters?: object[];
  guidelines?: object[];
}

interface DBUserDocument extends DBUser, Document {

}

interface DBUserModel extends Model<DBUserDocument> {
  getFromUid: (uid: string) => Promise<DBUserDocument>;
  getFromObjId: (_id: string) => Promise<DBUserDocument>;
  createNewUser: (uid: DecodedIdToken) => Promise<DBUserDocument>;
  search: (keyword: string) => Promise<[DBUserDocument]>;
}

const UserSchema = new Schema<DBUserDocument>({
  uid: {
    required: true,
    unique: true,
    type: String,
  },
  email: String,
  displayName: {
    required: true,
    type: String,
  },
  photoURL: {
    type: String
  },
  bio: {
    required: true,
    type: String
  },
  signupDate: {
    required: true,
    type: Number
  },
  instagramName: {
    type: String
  },
  tiktokName: {
    type: String
  },
  youtubeName: {
    type: String
  }
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
})

UserSchema.statics.search = async function(keyword: string) {
  let result = await User.find({
    $or: [
      { displayName: { $regex: new RegExp(keyword, 'i') } },
      { bio: { $regex: new RegExp(keyword, 'i') } }
    ],
  })
  return result;  
}

UserSchema.statics.getFromUid = async function(uid: string) {
  try {
    var result = (await User.findOne({ uid: uid }).populate('follower').populate('following'))?.toObject()
    if (!result) {
      return null;
    }
    const credits = await Credit.find({ 
      uid: uid,
      $or: [
        { expireAt: { $gt: Date.now() } },
        { expireAt: -1 }
      ]
    })
    const creditAmount = credits.reduce((amount, credit) =>  amount + credit.amount , 0)
    result.credit = creditAmount
    const guidelines = await purchasedGuidelines(uid);
    const filters = await purchasedFilters(uid);
    result.filters = filters;
    result.guidelines = guidelines;
    return result;
  } catch(error) {
    throw error;
  }
}

UserSchema.statics.getFromObjId = async function(_id: string) {
  try {
    const result = (await User.findById(_id).populate('follower').populate('following'))?.toObject()
    if (!result) {
      return null;
    }
    const credits = await Credit.find({ 
      uid: result.uid,
      $or: [
        { expireAt: { $gt: Date.now() } },
        { expireAt: -1 }
      ]
    })
    const creditAmount = credits.reduce((amount, credit) =>  amount + credit.amount , 0)
    result.credit = creditAmount;
    return result;
  } catch(error) {
    throw error;
  } 
}

UserSchema.statics.createNewUser = async function(token: DecodedIdToken) {
  const displayName = token.name ?? `큐핏${token.uid.substring(0, 4)}`;
  const bio = `안녕하세요 ${displayName}입니다.`;
  const signupDate = Date.now();
  const newUser = new this({
    uid: token.uid,
    email: token.email,
    displayName: displayName,
    photoURL: token.picture,
    bio: bio,
    signupDate: signupDate,
    productInUse: []
  })
  try {
    const result = await newUser.save();
    return result;
  } catch(error) {
    throw error;
  }
}

UserSchema.virtual('follower', {
  ref: "Follow",
  localField: 'uid',
  foreignField: 'dstUid',
  count: true
})

UserSchema.virtual("following", {
  ref: 'Follow',
  localField: 'uid',
  foreignField: 'srcUid',
  count: true
})

async function purchasedFilters(uid: string) : Promise<object[]> {
  const orders = await Order.find({uid: uid});
  const filterIds = orders.filter(order => order.productType.toLowerCase() === "filter").map(order => order.productId);
  const filters = await Filter.find({_id: { $in: filterIds }})
  .populate('likedCount')
  .populate('wishedCount')
  .populate('usedCount')
  .populate('creator')
  .populate('authStatus');
  return filters
}

async function purchasedGuidelines(uid: string) : Promise<object[]> {
  const orders = await Order.find({uid: uid});
  const guidelineIds = orders.filter(order => order.productType.toLowerCase() === "guideline").map(order => order.productId);
  const guidelines = await Guideline.find({_id: { $in: guidelineIds }})
  .populate('likedCount')
  .populate('wishedCount')
  .populate('usedCount')
  .populate('creator')
  .populate('authStatus');
  return guidelines
}

const User = mongoose.model<DBUserDocument, DBUserModel>("User", UserSchema, "user");

export { User, UserSchema, DBUserDocument };
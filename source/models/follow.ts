import mongoose, {Schema, Model, Document} from "mongoose"

interface DBFollow {
  srcUid: string;
  dstUid: string;
  createdAt: number;
}

interface DBFollowDocument extends DBFollow, Document {

}

interface DBFollowModel extends Model<DBFollowDocument> {
  follow: (srcUid: string, dstUid: string) => Promise<boolean>;
  isFollowed: (srcUid: string, dstUid: string) => Promise<boolean>;
}

const FollowSchema = new Schema<DBFollowDocument>({
  srcUid: {
    required: true,
    type: String,
  },
  dstUid: {
    required: true,
    type: String,
  },
  createdAt: {
    required: true,
    type: Number
  }
})

FollowSchema.statics.follow = async function(srcUid: string, dstUid: string) {
  try {
    const findResult = await Follow.findOne({ srcUid: srcUid, dstUid: dstUid });
    if(findResult) {
      await this.deleteOne({ _id: findResult._id });
      return false;
    } else {
      const newFollowData = new this({
        srcUid: srcUid,
        dstUid: dstUid,
        createdAt: Date.now()
      });
      await newFollowData.save();
      return true;
    }
  } catch(error) {
    throw error
  }
}

FollowSchema.statics.isFollowed = async function(srcUid: string, dstUid: string) {
  try {
    const findResult = await Follow.exists({ srcUid: srcUid, dstUid: dstUid });
    return findResult !== null;
  } catch(error) {
    throw error
  }
}

const Follow = mongoose.model<DBFollowDocument, DBFollowModel>('Follow', FollowSchema, 'follow')
export { Follow, FollowSchema }
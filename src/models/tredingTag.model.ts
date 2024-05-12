import mongoose, { Schema, Document, Model } from 'mongoose';
import { Guideline } from './guideline.model';

interface DBTrendingPose {
  name: string;
  createdAt: number;
  imageUrl?: string;
  present: boolean;
}

interface DBTrendingPoseDocument extends DBTrendingPose, Document {

}

interface DBTrendingPoseModel extends Model<DBTrendingPoseDocument> {
  getList: () => Promise<any>;
}

const TrendingPoseSchema: Schema<DBTrendingPoseDocument> = new Schema({
  name: {
    required: true,
    type: String,
  },
  createdAt: {
    required: true,
    type: Number,
  },
  imageUrl: {
    type: String,
  },
  present: {
    required: true,
    type: Boolean,
  }
});

TrendingPoseSchema.statics.getList = async function() {
  try {
    const poses = await TrendingPose.find({ present: true });
    var result: any = [];
    for (var pose of poses) {
      let name = pose.name
      let guidelines = await Guideline.getListFromTag(pose.name);;
      let current: any = {}
      current[name] = guidelines
      result.push(current);
    }
    return result;
  } catch (error) {
    throw error;
  }
}

const TrendingPose = mongoose.model<DBTrendingPoseDocument, DBTrendingPoseModel>('TrendingPose', TrendingPoseSchema, 'trendingPose');

export { TrendingPose, TrendingPoseSchema };
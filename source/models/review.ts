import mongoose, { Schema } from 'mongoose';

interface DBReview {
  uid: string;
  imageUrl: string;
  stars: number;
  productId: mongoose.Schema.Types.ObjectId;
  productType: string;
  comment: string;
  createdAt: number;
}

const ReviewSchema = new Schema<DBReview>({
  uid: {
    required: true,
    type: String,
  },
  imageUrl: {
    required: true,
    type: String
  },
  stars: {
    required: true,
    type: Number,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'productType',
    required: true
  },
  productType: {
    required: true,
    type: String,
    enum: ['Filter', 'Guideline']
  },
  createdAt: {
    required: true,
    type: Number
  },
  comment: {
    type: String
  }
})

const Review = mongoose.model<DBReview>('Review', ReviewSchema, 'review')
export { Review, ReviewSchema };
import mongoose, { Schema } from 'mongoose';

interface DBReview {
  uid: string;
  reviewImageUrl: string;
  stars: number;
  productId: string;
  comment: string;
  createdAt: number;
}

const ReviewSchema = new Schema<DBReview>({
  uid: {
    required: true,
    type: String,
  },
  reviewImageUrl: {
    required: true,
    type: String
  },
  stars: {
    required: true,
    type: Number,
  },
  productId: {
    required: true,
    type: String,
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
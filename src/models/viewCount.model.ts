import mongoose, { Schema, Document, Model } from 'mongoose';

interface DBviewCount {
  productId: mongoose.Schema.Types.ObjectId;
  productType: string;
}

interface DBviewCountDocument extends DBviewCount, Document {

}

interface DBviewCountModel extends Model<DBviewCountDocument> {
}

const viewCountSchema = new Schema<DBviewCountDocument>({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'productType',
    required: true
  },
  productType: {
    required: true,
    type: String,
    enum: ['Filter', 'Guideline', 'PhotoZone']
  }
})

const ViewCount = mongoose.model<DBviewCountDocument, DBviewCountModel>('ViewCount', viewCountSchema, 'viewCount');
export { ViewCount, viewCountSchema }
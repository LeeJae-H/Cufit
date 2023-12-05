import mongoose, { Schema, Document, Model } from 'mongoose';

interface DBOrder {
  uid: string;
  productId: mongoose.Schema.Types.ObjectId;
  productType: string;
  orderType: string;
  createdAt: number;
}

interface DBOrderDocument extends DBOrder, Document {

}

interface DBOrderModel extends Model<DBOrderDocument> {
  isExist: (uid: string, productId: string, productType: string) => Promise<boolean>;
}

const OrderSchema = new Schema<DBOrderDocument>({
  uid: {
    type: String,
    required: true
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
  orderType: {
    required: true,
    type: String,
  },
  createdAt: {
    required: true,
    type: Number
  }
})

OrderSchema.statics.isExist = async function(productId: string, uid: string, productType: string) {
  const result = await Order.findOne({ productId: productId, uid: uid, productType: productType })
  if(result) {
    return true
  } else {
    return false
  }
}

const Order = mongoose.model<DBOrderDocument, DBOrderModel>('Order', OrderSchema, 'order');
export { Order, OrderSchema }
import mongoose, {Schema} from "mongoose"

interface DBReceipt {
  uid: string;
  productId: string;
  createdAt: number;
  credit: number;
}

const ReceiptSchema = new Schema<DBReceipt>({
  uid: {
    required: true,
    type: String,
  },
  productId: {
    required: true,
    type: String,
  },
  createdAt: {
    required: true,
    type: Number
  },
  credit: {
    required: true,
    type: Number
  }
})

const Receipt = mongoose.model<DBReceipt>('Receipt', ReceiptSchema, 'receipt');

export { Receipt, ReceiptSchema };
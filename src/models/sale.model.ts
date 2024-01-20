import mongoose, { Schema } from 'mongoose';

interface DBSale {
  uid: string;
  productId: string;
  createdAt: number;
}

const SaleSchema: Schema<DBSale> = new Schema({
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
    type: Number,
  },
});

const Sale = mongoose.model<DBSale>('Sale', SaleSchema, 'sale');

export { Sale, SaleSchema };
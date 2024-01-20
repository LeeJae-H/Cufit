import mongoose, {Schema} from "mongoose"

interface DBIncome {
  uid: string;
  product: mongoose.Schema.Types.ObjectId;
  productType: string;
  order: mongoose.Schema.Types.ObjectId;
  status: string;
  createdAt: number;
  settledAt: number;
  amount: number;
}

const IncomeSchema = new Schema<DBIncome>({
  uid: {
    required: true,
    type: String,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'productType',
    required: true
  },
  productType: {
    required: true,
    type: String,
    enum: ['Filter', 'Guideline']
  },
  order: {
    required: true,
    ref: 'Order',
    type: mongoose.Schema.Types.ObjectId
  },
  status: {
    required: true,
    type: String,
    enum: ["before", "processing", "complete"],
    default: "before"
  },
  createdAt: {
    required: true,
    type: Number
  },
  settledAt: {
    type: Number
  },
  amount: {
    required: true,
    type: Number
  }
})

const Income = mongoose.model<DBIncome>('Income', IncomeSchema, 'income');
export { Income, IncomeSchema };
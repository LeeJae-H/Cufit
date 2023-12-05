import mongoose, {Schema} from "mongoose"

interface DBIncome {
  uid: string;
  orderId: string;
  isSettled: boolean;
  createdAt: number;
  settledAt: number;
}

const IncomeSchema = new Schema<DBIncome>({
  uid: {
    required: true,
    type: String,
  },
  orderId: {
    required: true,
    type: String
  },
  isSettled: {
    required: true,
    type: Boolean,
  },
  createdAt: {
    required: true,
    type: Number
  },
  settledAt: {
    type: Number
  },
})

const Income = mongoose.model<DBIncome>('Income', IncomeSchema, 'income');
export { Income, IncomeSchema };
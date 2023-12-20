import mongoose, { Schema, Document, Model } from "mongoose"
interface DBCredit {
  uid: string;
  amount: number;
  createdAt: number;
  expireAt: number;
  atid: string;
  creditType: string;
}

interface DBCreditDocument extends DBCredit, Document {

}
interface DBCreditModel extends Model<DBCreditDocument> {

}

const CreditSchema = new Schema<DBCreditDocument>({
  uid: {
    required: true,
    type: String,
  },
  amount: {
    required: true,
    type: Number,
  },
  createdAt: {
    required: true,
    type: Number
  },
  expireAt: {
    type: Number,
  },
  creditType: {
    required: true,
    type: String,
    enum: ['PURCHASE', 'ADMIN', 'AD', 'EVENT', 'REVIEW']
  },
  atid: {
    type: String
  },
})

interface DBCreditTransaction {
  transactionType: string;
  amount: number;
  creditId: string;
  createdAt: number;
}

interface DBCreditTransactionDocument extends Document, DBCreditTransaction {

}

interface DBCreditTransactionModel extends Model<DBCreditTransactionDocument> {

}

const CreditTransactionSchema = new Schema<DBCreditTransactionDocument>({
  transactionType: {
    required: true,
    type: String,
    enum: ['PURCHASE_PRODUCT', 'PURCHASE_CREDIT']
  },
  amount: {
    required: true,
    type: Number,
  },
  createdAt: {
    required: true,
    type: Number
  },
  creditId: {
    required: true,
    type: String
  },
})

const Credit = mongoose.model<DBCreditDocument, DBCreditModel>('Credit', CreditSchema, 'credit');
const CreditTransaction = mongoose.model<DBCreditTransactionDocument, DBCreditTransactionModel>('CreditTransaction', CreditTransactionSchema, 'credit_transaction')
export { Credit, CreditTransaction };
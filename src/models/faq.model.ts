import mongoose, { Schema, Document, Model } from 'mongoose';

interface DBFaq {
  title: string,
  uid: string,
  createdAt: number,
  content: string,
  faqType: string
}

interface DBFaqDocument extends DBFaq, Document {

}

interface DBFaqModel extends Model<DBFaqDocument> {
  list: () => Promise<[DBFaqDocument]>;
  getFromUid: (uid: string) => Promise<[DBFaqDocument]>;
}

const FaqSchema = new Schema<DBFaqDocument>({
  title: { required: true, type: String },
  uid: { required: true, type: String },
  createdAt: { required: true, type: Number },
  content: { required: true, type: String },
  faqType: { 
    required: true, 
    type: String, 
    enum: [
      'CREDIT', 'CREATOR', 'PRODUCT', 'ETC'
    ]
  }
});

FaqSchema.statics.list = async function() {
  const faqs = await Faq.aggregate([
    {
      $lookup: {
        from: 'faq_answer',
        localField: '_id',
        foreignField: 'faqId',
        as: 'faqAnswers'
      }
    },
    {
      $match: {
        faqAnswers: { $eq: [] }
      }
    }
  ])
  return faqs;
}

FaqSchema.statics.getFromUid = async function(uid: string) {
  const faqs = await Faq.aggregate([
    {
      $lookup: {
        from: 'faq_answer',
        localField: '_id',
        foreignField: 'faqId',
        as: 'faqAnswers'
      }
    },
    {
      $match: {
        uid: uid,
      }
    }
  ])
  console.log(faqs)
  return faqs;
}

const Faq = mongoose.model<DBFaqDocument, DBFaqModel>("Faq", FaqSchema, "faq");

interface DBFaqAnswer {
  faqId: mongoose.Schema.Types.ObjectId,
  title: string,
  content: string,
  createdAt: number
}

interface DBFaqAnswerDocument extends DBFaqAnswer, Document {

}

interface DBFaqAnswerModel extends Model<DBFaqAnswerDocument> {
  
}

const FaqAnswerSchema = new Schema<DBFaqAnswerDocument>({
  faqId: { required: true, ref: 'faq', type: mongoose.Schema.Types.ObjectId },
  title: { required: true, type: String },
  content: { required: true, type: String },
  createdAt: { required: true, type: Number },
});

const FaqAnswer = mongoose.model<DBFaqAnswerDocument, DBFaqAnswerModel>("FaqAnswer", FaqAnswerSchema, "faq_answer");
export { FaqAnswer, FaqAnswerSchema, Faq, FaqSchema };
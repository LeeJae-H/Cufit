import mongoose, { Schema, Document, Model } from 'mongoose';

interface DBSearchedKeyword {
  keyword: string;
  createdAt: number;
  uid?: string;
}

interface DBSearchedKeywordDocument extends DBSearchedKeyword, Document {

}

interface DBSearchedKeywordModel extends Model<DBSearchedKeywordDocument> {
}

const SearchedKeywordSchema: Schema<DBSearchedKeywordDocument> = new Schema({
  keyword: {
    required: true,
    type: String,
  },
  createdAt: {
    required: true,
    type: Number,
  },
  uid: {
    type: String,
  }
});

const SearchedKeyword = mongoose.model<DBSearchedKeywordDocument, DBSearchedKeywordModel>('SearchedKeyword', SearchedKeywordSchema, 'searchedKeyword');

export { SearchedKeyword, SearchedKeywordSchema };
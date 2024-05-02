import mongoose, { Schema, Document, Model } from 'mongoose';

interface DBSearchedKeyword {
  name: string;
  createdAt: number;
  imageUrl?: string;
  present: boolean;
}

interface DBSearchedKeywordDocument extends DBSearchedKeyword, Document {

}

interface DBSearchedKeywordModel extends Model<DBSearchedKeywordDocument> {
}

const SearchedKeywordSchema: Schema<DBSearchedKeywordDocument> = new Schema({
  name: {
    required: true,
    type: String,
  },
  createdAt: {
    required: true,
    type: Number,
  },
  imageUrl: {
    type: String,
  },
  present: {
    required: true,
    type: Boolean,
  }
});

const SearchedKeyword = mongoose.model<DBSearchedKeywordDocument, DBSearchedKeywordModel>('SearchedKeyword', SearchedKeywordSchema, 'searchedKeyword');

export { SearchedKeyword, SearchedKeywordSchema };
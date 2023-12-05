import mongoose, { Schema, Document, Model } from 'mongoose';

interface DBContents {
  list: object[],
  type: string
}

interface DBContentsDocument extends DBContents, Document {

}

interface DBFilterModel extends Model<DBContentsDocument> {
  
}

const ContentsSchema = new Schema<DBContentsDocument>({
  list: {
    required: true,
    type:
    [
      {
        d: {type: String, required: true},
        t: {type: String, required: true}, 
        b: {type: String, required: true}, 
        s: {type: String, required: true}
      }
    ]
  },
  type: {type: String, required: true}
  // d -> displayName, t-> tag, b -> sort by(l: latest, p: popularity), s -> sort(a: asc, d: dsc)
});

const Contents = mongoose.model<DBContentsDocument, DBFilterModel>("Contents", ContentsSchema, "contents");
export { Contents, ContentsSchema };
import mongoose, { Schema, Document, Model } from 'mongoose';

interface DBContents {
  list: object[],
  type: string
}

interface DBContentsDocument extends DBContents, Document {

}

interface DBContentsModel extends Model<DBContentsDocument> {
  getGuidelineContents: () => Promise<DBContentsDocument>;
  getFilterContents: () => Promise<DBContentsDocument>;
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
  /**
   * d -> displayName, 
   * t-> tag, 
   * b -> sort by(l: latest, p: popularity), 
   * s -> sort(a: asc, d: dsc)
   *  */ 
});

ContentsSchema.statics.getGuidelineContents = async function(){
  try{
    const result = Contents.findOne({ type: "Guideline" }).sort({ _id: -1 });
    return result;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

ContentsSchema.statics.getFilterContents = async function(){
  try{
    const result = Contents.findOne({ type: "Filter" }).sort({ _id: -1 });
    return result;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

const Contents = mongoose.model<DBContentsDocument, DBContentsModel>("Contents", ContentsSchema, "contents");
export { Contents, ContentsSchema };
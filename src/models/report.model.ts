import mongoose, { Schema, Document, Model } from 'mongoose';

interface DBReport {
  targetId: mongoose.Schema.Types.ObjectId,
  targetType: string,
  message: string,
  createdAt: number,
  uid: string
}

interface DBReportDocument extends DBReport, Document {

}

interface DBReportModel extends Model<DBReportDocument> {
  
}

const ReportSchema = new Schema<DBReportDocument>({
  targetId: {
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'targetType'
  },
  targetType: {
    required: true,
    type: String,
    enum: ['Filter', 'Guideline', 'PhotoZone']
  },
  createdAt: {
    required: true,
    type: Number
  },
  message: {
    required: true,
    type: String
  },
  uid: {
    required: true,
    type: String
  }
});

const Report = mongoose.model<DBReportDocument, DBReportModel>("Report", ReportSchema, "report");
export { Report, ReportSchema };
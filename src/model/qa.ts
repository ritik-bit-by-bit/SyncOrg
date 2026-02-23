import mongoose, { Schema, Document } from "mongoose";

export interface QnA extends Document {
  _id: string;
  qnaId: string;
  linkId?: string;
  ownerUserId: mongoose.Types.ObjectId;
  questionId?: mongoose.Types.ObjectId; // Reference to message
  questionText: string;
  answerText?: string;
  anonVisitorId?: string; // To identify if question asker is signed up
  createdAt: Date;
  answeredAt?: Date;
  isPublic: boolean;
}

const qnaSchema: Schema<QnA> = new Schema({
  qnaId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  linkId: {
    type: String,
    index: true
  },
  ownerUserId: {
    type: Schema.Types.ObjectId,
    ref: 'AnnonymousMessageUser',
    required: true,
    index: true
  },
  questionId: {
    type: Schema.Types.ObjectId,
    ref: 'Message'
  },
  questionText: {
    type: String,
    required: true
  },
  answerText: {
    type: String,
    default: null
  },
  anonVisitorId: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  answeredAt: {
    type: Date,
    default: null
  },
  isPublic: {
    type: Boolean,
    default: true
  }
});

const QnAModel = mongoose.models.QnA || mongoose.model<QnA>("QnA", qnaSchema);
export default QnAModel;


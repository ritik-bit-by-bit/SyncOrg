import mongoose, { Schema, Document } from "mongoose";

export interface Link extends Document {
  _id: string;
  linkId: string; // Short token
  ownerUserId: mongoose.Types.ObjectId;
  mode: 'message' | 'qa' | 'poll';
  expiresAt?: Date;
  maxMessages?: number;
  messagesCount: number;
  createdAt: Date;
  title?: string;
  description?: string;
  isActive: boolean;
}

const linkSchema: Schema<Link> = new Schema({
  linkId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  ownerUserId: {
    type: Schema.Types.ObjectId,
    ref: 'AnnonymousMessageUser',
    required: true
  },
  mode: {
    type: String,
    enum: ['message', 'qa', 'poll'],
    default: 'message'
  },
  expiresAt: {
    type: Date,
    default: null
  },
  maxMessages: {
    type: Number,
    default: null
  },
  messagesCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

const LinkModel = mongoose.models.Link || mongoose.model<Link>("Link", linkSchema);
export default LinkModel;


import mongoose, { Schema, Document } from "mongoose";

export interface PollOption {
  optionId: string;
  label: string;
  votesCount: number;
}

export interface PollVote {
  anonVisitorId: string;
  optionId: string;
  timestamp: Date;
}

export interface Poll extends Document {
  _id: string;
  pollId: string;
  linkId?: string;
  ownerUserId: mongoose.Types.ObjectId;
  question: string;
  options: PollOption[];
  votes: PollVote[];
  allowMultiple: boolean;
  createdAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}

const pollOptionSchema = new Schema({
  optionId: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  votesCount: {
    type: Number,
    default: 0
  }
}, { _id: false });

const pollVoteSchema = new Schema({
  anonVisitorId: {
    type: String,
    required: true
  },
  optionId: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const pollSchema: Schema<Poll> = new Schema({
  pollId: {
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
  question: {
    type: String,
    required: true
  },
  options: {
    type: [pollOptionSchema],
    required: true,
    validate: {
      validator: (options: PollOption[]) => options.length >= 2,
      message: 'Poll must have at least 2 options'
    }
  },
  votes: {
    type: [pollVoteSchema],
    default: []
  },
  allowMultiple: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

const PollModel = mongoose.models.Poll || mongoose.model<Poll>("Poll", pollSchema);
export default PollModel;


import mongoose, { Schema, Document } from "mongoose";

export interface Analytics extends Document {
  _id: string;
  linkId?: string;
  username?: string;
  timestamp: Date;
  anonVisitorId?: string;
  ip?: string;
  country?: string;
  deviceType: 'mobile' | 'desktop' | 'tablet' | 'unknown';
  eventType: 'visit' | 'submit' | 'vote';
  page: string;
}

const analyticsSchema: Schema<Analytics> = new Schema({
  linkId: {
    type: String,
    index: true
  },
  username: {
    type: String,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  anonVisitorId: {
    type: String,
    index: true
  },
  ip: {
    type: String
  },
  country: {
    type: String
  },
  deviceType: {
    type: String,
    enum: ['mobile', 'desktop', 'tablet', 'unknown'],
    default: 'unknown'
  },
  eventType: {
    type: String,
    enum: ['visit', 'submit', 'vote'],
    required: true
  },
  page: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
analyticsSchema.index({ linkId: 1, timestamp: -1 });
analyticsSchema.index({ username: 1, timestamp: -1 });
analyticsSchema.index({ eventType: 1, timestamp: -1 });

const AnalyticsModel = mongoose.models.Analytics || mongoose.model<Analytics>("Analytics", analyticsSchema);
export default AnalyticsModel;


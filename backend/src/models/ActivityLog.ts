import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLog extends Document {
  user: mongoose.Types.ObjectId;
  action: string;
  module: string;
  details?: string;
  timestamp: Date;
}

const activityLogSchema = new Schema<IActivityLog>({
  user:      { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  action:    { type: String, required: true },
  module:    { type: String, required: true, index: true },
  details:   { type: String },
  timestamp: { type: Date, default: Date.now, index: true },
});

export const ActivityLog = mongoose.model<IActivityLog>('ActivityLog', activityLogSchema);

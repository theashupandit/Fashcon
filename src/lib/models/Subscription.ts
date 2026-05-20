import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscription extends Document {
  email: string;
  createdAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default (mongoose.models.Subscription as mongoose.Model<ISubscription>) || mongoose.model<ISubscription>('Subscription', SubscriptionSchema);

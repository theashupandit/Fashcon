import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  displayName: string;
  role: 'user' | 'admin' | 'super_admin';
  photoURL?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin', 'super_admin'], default: 'user' },
  photoURL: { type: String },
  lastLogin: { type: Date },
}, { 
  timestamps: true 
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  displayName: string;
  role: 'user' | 'manager' | 'admin' | 'super_admin' | 'blog_writer' | 'support_agent' | 'store_manager' | 'marketing_specialist';
  password?: string;
  photoURL?: string;
  username?: string;
  phone?: string;
  office?: string;
  bio?: string;
  lastLogin?: Date;
  permissions?: {
    dashboard: boolean;
    analytics: boolean;
    store: boolean;
    products: boolean;
    media: boolean;
    inbox: boolean;
    blogs: boolean;
    marketing: boolean;
    pinterest: boolean;
    settings: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  role: { type: String, enum: ['user', 'manager', 'admin', 'super_admin', 'blog_writer', 'support_agent', 'store_manager', 'marketing_specialist'], default: 'user' },
  password: { type: String },
  photoURL: { type: String },
  username: { type: String },
  phone: { type: String },
  office: { type: String },
  bio: { type: String },
  lastLogin: { type: Date },
  permissions: {
    dashboard: { type: Boolean, default: true },
    analytics: { type: Boolean, default: false },
    store: { type: Boolean, default: false },
    products: { type: Boolean, default: false },
    media: { type: Boolean, default: false },
    inbox: { type: Boolean, default: false },
    blogs: { type: Boolean, default: false },
    marketing: { type: Boolean, default: false },
    pinterest: { type: Boolean, default: false },
    settings: { type: Boolean, default: false },
  }
}, { 
  timestamps: true 
});

if (mongoose.models.User) {
  delete mongoose.models.User;
}
export default mongoose.model<IUser>('User', UserSchema);

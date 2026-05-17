import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFolder extends Document {
  name: string;
  parentId: mongoose.Types.ObjectId | null;
  path: string;
  createdAt: Date;
  updatedAt: Date;
}

const folderSchema = new Schema<IFolder>({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  parentId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Folder', 
    default: null // Null means it's a root folder
  },
  path: { 
    type: String, 
    required: true 
    // Example: "/Products/Dresses"
  }
}, { timestamps: true });

const Folder: Model<IFolder> = mongoose.models.Folder || mongoose.model<IFolder>('Folder', folderSchema);

export default Folder;

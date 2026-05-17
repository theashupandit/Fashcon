import mongoose, { Schema, model, models } from 'mongoose';

export interface IMedia {
  _id?: string;
  name: string;
  url: string;
  size: number;
  type: string;
  path: string; // original storage path or identifier
  createdAt: Date;
  updatedAt: Date;
}

const MediaSchema = new Schema<IMedia>(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    size: { type: Number, required: true },
    type: { type: String, required: true },
    path: { type: String, required: true },
  },
  { timestamps: true }
);

const Media = models.Media || model<IMedia>('Media', MediaSchema);

export default Media;

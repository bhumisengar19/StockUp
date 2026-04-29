import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: 'admin';
  isActive: boolean;
  profileImage?: string;
  linkedId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username:     { type: String, required: true, unique: true, trim: true },
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:     { type: String, required: true },
    role:         { type: String, enum: ['admin'], default: 'admin' },
    isActive:     { type: Boolean, default: true },
    profileImage: { type: String },
    linkedId:     { type: Schema.Types.ObjectId },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', userSchema);


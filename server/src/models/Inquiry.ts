import mongoose, { Document, Schema } from 'mongoose';

export interface IInquiry extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'New' | 'In Progress' | 'Resolved';
  createdAt: Date;
}

const inquirySchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, required: true, default: 'New', enum: ['New', 'In Progress', 'Resolved'] },
  },
  { timestamps: true }
);

const Inquiry = mongoose.model<IInquiry>('Inquiry', inquirySchema);
export default Inquiry;
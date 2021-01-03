import { Document, model, Schema } from 'mongoose';

export interface MessageInterface {
  text: string;
  date: Date;
}

export type MessageDocument = Document & MessageInterface;

const MessageSchema = new Schema({
  text: { type: String, required: true },
  date: { type: Date, required: true },
});

export default model<MessageDocument>('Message', MessageSchema);

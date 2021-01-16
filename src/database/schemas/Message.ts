import { Document, model, Schema } from 'mongoose';

// export interface MessageData {
//   text: string;
//   date: Date;
//   senderUserId: number;
// }

export interface MessageInterface {
  _id?: string;
  text: string;
  date: Date;
  senderUserId: number;
}

export type MessageDocument = Document & MessageInterface;

const MessageSchema = new Schema({
  text: { type: String, required: true },
  date: { type: Date, required: true },

  senderUserId: { type: Number, required: true },
});

export default model<MessageDocument>('Message', MessageSchema);

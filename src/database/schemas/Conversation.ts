import { Document, model, Schema } from 'mongoose';
import { MessageInterface } from './Message';

export interface ConversationInterface {
  userId: number;
  toUserId: number;
  messages: MessageInterface[] | string[];
}

export type ConversationDocument = Document & ConversationInterface;

const ConversationSchema = new Schema({
  userId: { type: Number, required: true },
  toUserId: { type: Number, required: true },
  messages: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Message',
    },
  ],
});

export default model<ConversationDocument>('Conversation', ConversationSchema);

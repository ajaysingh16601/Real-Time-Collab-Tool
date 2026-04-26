import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage {
  user: string;
  text: string;
  timestamp: Date;
}

export interface ISession extends Document {
  sessionId: string;
  content: string;
  messages: IMessage[];
  createdAt: Date;
}

const MessageSchema: Schema = new Schema({
  user: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const SessionSchema: Schema = new Schema({
  sessionId: { type: String, required: true, unique: true },
  content: { type: String, default: '' },
  messages: [MessageSchema],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<ISession>('Session', SessionSchema);

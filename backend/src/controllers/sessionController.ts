import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Session from '../models/Session';
import mongoose from 'mongoose';

// In-memory fallback for testing without a real DB or if DB fails
const memoryStore = new Map<string, any>();

export const createSession = async (req: Request, res: Response) => {
  try {
    const sessionId = uuidv4().substring(0, 8);
    console.log(`Creating session: ${sessionId}, DB State: ${mongoose.connection.readyState}`);
    
    try {
      if (mongoose.connection.readyState === 1) {
        const newSession = new Session({ sessionId });
        await newSession.save();
        console.log('✅ Saved to MongoDB');
      } else {
        throw new Error('DB not connected');
      }
    } catch (dbError: any) {
      console.warn(`⚠️ DB Error (${dbError.message}), falling back to memory.`);
      memoryStore.set(sessionId, { sessionId, content: '', messages: [], createdAt: new Date() });
    }
    
    res.status(201).json({ sessionId });
  } catch (error: any) {
    console.error('Create Session Error:', error.message);
    res.status(500).json({ error: 'Failed to create session', detail: error.message });
  }
};

export const joinSession = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body;
    
    let session;
    try {
      if (mongoose.connection.readyState === 1) {
        session = await Session.findOne({ sessionId });
      } else {
        throw new Error('DB not connected');
      }
    } catch (dbError) {
      session = memoryStore.get(sessionId as string);
    }

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.status(200).json({ sessionId: session.sessionId });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to join session', detail: error.message });
  }
};

export const getSession = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    
    let session;
    try {
      if (mongoose.connection.readyState === 1) {
        session = await Session.findOne({ sessionId: id });
      } else {
        throw new Error('DB not connected');
      }
    } catch (dbError) {
      session = memoryStore.get(id);
    }

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.status(200).json(session);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch session', detail: error.message });
  }
};

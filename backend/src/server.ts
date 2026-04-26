import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import sessionRoutes from './routes/sessionRoutes';
import { setupSocketHandlers } from './sockets/socketHandler';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// health check
app.get('/health-check', (req, res) => {
  res.send('CollabFlow Server Running!');
});
// Routes
app.use('/api/sessions', sessionRoutes);

// Socket.IO
setupSocketHandlers(io);

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/collab-tool';

console.log('Connecting to MongoDB...');
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    console.warn('⚠️ Server will run, but persistence will be disabled (DB operations will fail).');
  });

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

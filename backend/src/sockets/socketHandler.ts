import { Server, Socket } from 'socket.io';
import Session from '../models/Session';

interface User {
  id: string;
  username: string;
  sessionId: string;
}

const activeUsers = new Map<string, User>();

export const setupSocketHandlers = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join_session', async ({ sessionId, username }) => {
      socket.join(sessionId);
      
      const user: User = { id: socket.id, username, sessionId };
      activeUsers.set(socket.id, user);

      // Notify others
      socket.to(sessionId).emit('user_joined', { username, id: socket.id });

      // Send current session state (content and messages)
      const session = await Session.findOne({ sessionId });
      if (session) {
        socket.emit('session_state', {
          content: session.content,
          messages: session.messages,
          users: Array.from(activeUsers.values()).filter(u => u.sessionId === sessionId)
        });
      }

      // Update all users in session about the new user list
      io.to(sessionId).emit('update_users', Array.from(activeUsers.values()).filter(u => u.sessionId === sessionId));
      
      // Activity Feed log
      io.to(sessionId).emit('activity', `${username} joined the session`);
    });

    socket.on('editor_update', async ({ sessionId, content }) => {
      // Basic last-write-wins: Update DB and broadcast
      await Session.findOneAndUpdate({ sessionId }, { content });
      socket.to(sessionId).emit('editor_update', content);
    });

    socket.on('send_message', async ({ sessionId, username, text }) => {
      const message = { user: username, text, timestamp: new Date() };
      
      // Persist message
      await Session.findOneAndUpdate(
        { sessionId },
        { $push: { messages: message } }
      );

      io.to(sessionId).emit('new_message', message);
    });

    socket.on('disconnect', () => {
      const user = activeUsers.get(socket.id);
      if (user) {
        const { sessionId, username } = user;
        activeUsers.delete(socket.id);
        
        io.to(sessionId).emit('user_left', { username, id: socket.id });
        io.to(sessionId).emit('update_users', Array.from(activeUsers.values()).filter(u => u.sessionId === sessionId));
        io.to(sessionId).emit('activity', `${username} left the session`);
        
        console.log(`User disconnected: ${username} (${socket.id})`);
      }
    });
  });
};

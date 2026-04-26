import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const useSocket = (sessionId: string | null, username: string | null) => {
  const socketRef = useRef<Socket | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [activity, setActivity] = useState<string[]>([]);

  useEffect(() => {
    if (!sessionId || !username) return;

    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join_session', { sessionId, username });
    });

    socket.on('session_state', (state) => {
      setContent(state.content);
      setMessages(state.messages);
      setUsers(state.users);
    });

    socket.on('update_users', (updatedUsers) => {
      setUsers(updatedUsers);
    });

    socket.on('new_message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('editor_update', (newContent) => {
      setContent(newContent);
    });

    socket.on('activity', (msg) => {
      setActivity((prev) => [msg, ...prev].slice(0, 50));
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [sessionId, username]);

  const sendMessage = (text: string) => {
    if (socketRef.current && sessionId && username) {
      socketRef.current.emit('send_message', { sessionId, username, text });
    }
  };

  // Debounced editor update to avoid flooding the WebSocket
  const updateEditor = useCallback((newContent: string) => {
    // 1. Update local state immediately for smooth UI
    setContent(newContent);

    // 2. Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // 3. Set new timer to emit update after 500ms of inactivity
    debounceTimerRef.current = setTimeout(() => {
      if (socketRef.current && sessionId) {
        socketRef.current.emit('editor_update', { sessionId, content: newContent });
      }
    }, 500);
  }, [sessionId]);

  return { isConnected, users, messages, content, activity, sendMessage, updateEditor };
};

import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { 
  Users, 
  MessageSquare, 
  Send, 
  Hash, 
  Activity, 
  Copy, 
  Check,
  ChevronRight
} from 'lucide-react';

const CollaborationRoom: React.FC = () => {
  const { id: sessionId } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const username = location.state?.username;

  const [messageInput, setMessageInput] = useState('');
  const [copied, setCopied] = useState(false);

  // Redirect if no username
  useEffect(() => {
    if (!username) {
      navigate('/');
    }
  }, [username, navigate]);

  const { 
    isConnected, 
    users, 
    messages, 
    content, 
    activity, 
    sendMessage, 
    updateEditor 
  } = useSocket(sessionId || null, username || null);

  const handleCopyId = () => {
    if (sessionId) {
      navigator.clipboard.writeText(sessionId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim()) {
      sendMessage(messageInput.trim());
      setMessageInput('');
    }
  };

  if (!username) return null;

  return (
    <div className="h-screen flex flex-col bg-dark-900">
      {/* Header */}
      <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 bg-dark-900/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-lg">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <h1 className="font-bold text-lg">CollabFlow Room</h1>
          <div className="h-4 w-[1px] bg-slate-700 mx-2"></div>
          <button 
            onClick={handleCopyId}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors bg-dark-800 px-3 py-1.5 rounded-md text-sm border border-slate-700"
          >
            <Hash className="w-3.5 h-3.5" />
            <span className="font-mono">{sessionId}</span>
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs font-medium text-green-400">{isConnected ? 'Connected' : 'Connecting...'}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-xs">
            {username.substring(0, 2).toUpperCase()}
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Users & Activity */}
        <aside className="w-64 border-r border-slate-800 flex flex-col shrink-0 bg-dark-900/30">
          <div className="p-4 flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 mb-4 text-slate-300 text-sm font-semibold">
              <Users className="w-4 h-4" />
              <span>Participants ({users.length})</span>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
              {users.map((user) => (
                <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center text-xs font-bold border border-slate-600">
                      {user.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-dark-900"></div>
                  </div>
                  <span className="text-sm text-slate-200 truncate">{user.username} {user.username === username && '(You)'}</span>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <div className="flex items-center gap-2 mb-4 text-slate-300 text-sm font-semibold">
                <Activity className="w-4 h-4" />
                <span>Recent Activity</span>
              </div>
              <div className="h-40 overflow-y-auto custom-scrollbar space-y-2 text-[11px]">
                {activity.map((log, i) => (
                  <div key={i} className="text-slate-500 flex gap-2">
                    <ChevronRight className="w-3 h-3 mt-0.5 shrink-0" />
                    <span className="leading-tight">{log}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content: Shared Editor */}
        <main className="flex-1 flex flex-col bg-dark-800/20 p-6 overflow-hidden">
          <div className="flex-1 flex flex-col glass-card overflow-hidden">
            <div className="h-12 border-b border-slate-800 px-4 flex items-center gap-2 text-sm font-medium text-slate-400">
              <span className="text-primary font-mono text-xs">SHARED_DOCUMENT.TXT</span>
            </div>
            <textarea
              value={content}
              onChange={(e) => updateEditor(e.target.value)}
              className="flex-1 w-full bg-transparent p-6 outline-none resize-none font-mono text-slate-300 custom-scrollbar"
              placeholder="Start typing together..."
            />
          </div>
        </main>

        {/* Right Sidebar: Chat */}
        <aside className="w-80 border-l border-slate-800 flex flex-col shrink-0 bg-dark-900/30">
          <div className="p-4 h-12 border-b border-slate-800 flex items-center gap-2 text-slate-300 font-semibold text-sm">
            <MessageSquare className="w-4 h-4" />
            <span>Chat History</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.user === username ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-slate-500">{msg.user}</span>
                  <span className="text-[10px] text-slate-600">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${
                  msg.user === username 
                  ? 'bg-primary text-white rounded-tr-none' 
                  : 'bg-dark-700 text-slate-200 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800">
            <div className="relative">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message..."
                className="w-full bg-dark-800 border border-slate-700 rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-primary outline-none text-sm"
              />
              <button 
                type="submit"
                disabled={!messageInput.trim()}
                className="absolute right-2 top-2 p-1.5 bg-primary hover:bg-primary-hover rounded-lg text-white transition-all disabled:opacity-50 disabled:grayscale"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </aside>
      </div>
    </div>
  );
};

export default CollaborationRoom;

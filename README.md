# CollabFlow - Real-Time Collaboration Tool

CollabFlow is a real-time collaborative workspace where multiple users can join a shared session, chat, and edit documents simultaneously.

## Tech Stack
- **Frontend**: React (TypeScript), Vite, Tailwind CSS, Socket.IO Client, Lucide React.
- **Backend**: Node.js (TypeScript), Express, Socket.IO, Mongoose/MongoDB.
- **Infrastructure**: AWS EC2, Nginx.

## Features
- **Real-Time Editor**: Simultaneous editing with last-write-wins conflict resolution.
- **Presence System**: See who's online in the current session.
- **Activity Feed**: Live updates on user joins, leaves, and other actions.
- **Persistent Chat**: Chat history is stored in MongoDB and reloaded on join.
- **Session Management**: Create unique 8-character session IDs or join existing ones.

## Architecture
- **WebSockets**: Used for all real-time events (editor updates, chat, presence).
- **REST API**: Used for session creation and initial session discovery.
- **Persistence**: MongoDB stores session content and message history.

## Setup Instructions

### Backend
1. `cd backend`
2. `npm install`
3. Create `.env` from `.env.example` (or use default: `PORT=5005`, `MONGODB_URI=mongodb://localhost:27017/collab-tool`)
4. `npm run dev`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`
4. Access at `http://localhost:5173`

## Scaling Approach

### 1. Scaling the WebSocket Server
To handle thousands of concurrent users, we would:
- **Horizontal Scaling**: Deploy multiple backend instances behind a Load Balancer (ALB).
- **Redis Adapter**: Use `socket.io-redis` to synchronize events between different server instances. This ensures that a message sent by a user on Server A reaches users on Server B.
- **Sticky Sessions**: Enable sticky sessions on the ALB to ensure the WebSocket handshake completes successfully.

### 2. Database Scaling
- **MongoDB Atlas**: Use a managed cluster with sharding to distribute session data.
- **Indexing**: Ensure `sessionId` is indexed for fast lookups.

### 3. Managed Services (AWS)
- **AWS API Gateway (WebSocket mode)**: Instead of custom Socket.IO servers, we could use API Gateway to handle connections and trigger Lambda functions, which scales automatically.
- **Amazon ElastiCache (Redis)**: For high-performance message pub/sub and session state caching.

## Deployment (AWS EC2)
1. Launch an Ubuntu EC2 instance.
2. Install Node.js, NPM, and MongoDB.
3. Use **Nginx** as a reverse proxy:
   ```nginx
   server {
       listen 80;
       location / {
           proxy_pass http://localhost:5173; # Frontend
       }
       location /api/ {
           proxy_pass http://localhost:5005; # Backend REST
       }
       location /socket.io/ {
           proxy_pass http://localhost:5005; # Backend Sockets
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
       }
   }
   ```
4. Setup **GitHub Actions** to automate deployment on push.

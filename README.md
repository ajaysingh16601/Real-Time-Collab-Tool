# CollabFlow - Real-Time Collaboration Tool

CollabFlow is a real-time collaborative workspace where multiple users can join a shared session, chat, and edit documents simultaneously.

## Live Demo
http://43.204.98.247

## Tech Stack
- **Frontend**: React (TypeScript), Vite, Tailwind CSS, Socket.IO Client, Lucide React.
- **Backend**: Node.js (TypeScript), Express, Socket.IO, Mongoose/MongoDB.
- **Infrastructure**: AWS EC2, Nginx.

## Features
- **Real-Time Editor**: Simultaneous editing using a last-write-wins conflict resolution strategy.
- **Presence System**: See who's online in the current session.
- **Activity Feed**: Live updates on user joins, leaves, and other actions.
- **Persistent Chat**: Chat history is stored in MongoDB and reloaded on join.
- **Session Management**: Create unique session IDs or join existing ones.

## Architecture

- Client communicates with backend via:
  - REST APIs for session creation
  - WebSockets (Socket.IO) for real-time updates

- Nginx acts as a reverse proxy:
  - Serves frontend static files
  - Routes `/api` and `/socket.io` to backend

- Backend handles:
  - Session management
  - Real-time communication via Socket.IO rooms
  - Persistence using MongoDB Atlas

Flow:
Client → Nginx → Backend (PM2) → MongoDB Atlas
                 ↘ WebSocket (Socket.IO)

## Setup Instructions

### Backend
1. `cd backend`
2. `npm install`
3. Create `.env` from `.env.example` (or use default: `PORT=5005`, `MONGODB_URI=your_mongodb_atlas_connection_string`)
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
        root /var/www/html;
        index index.html;
        try_files $uri /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:5005;
    }

    location /socket.io/ {
        proxy_pass http://localhost:5005/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
   }
  ```
4. Setup **GitHub Actions** to automate deployment on push.

## CI/CD Pipeline

- Implemented using GitHub Actions
- On every push to `main`:
  - Builds frontend and backend
  - Connects to EC2 via SSH
  - Pulls latest code
  - Restarts backend using PM2
  - Deploys frontend via Nginx

This ensures automated and zero-manual deployment.

- Use PM2 to run backend in production:
  pm2 start dist/server.js --name collab-backend

## Environment Variables

### Backend (.env)
PORT=5005  
MONGODB_URI=mongodb://127.0.0.1:27017/collab-tool

### Frontend (.env)
VITE_BACKEND_URL=http://43.204.98.247

## Challenges Faced

- MongoDB Atlas permission error (fixed by assigning proper roles)
- Nginx proxy path mismatch causing 404 (resolved by removing trailing slash)
- WebSocket proxy issues handled via correct upgrade headers
- CI/CD pipeline configuration with Nginx Reverse Proxy and PM2 for production deployment

## How to Test

1. Open app in two browser tabs
2. Create a session in one tab
3. Join same session in another tab
4. Verify:
   - Real-time editor sync
   - Chat messages
   - Active users list
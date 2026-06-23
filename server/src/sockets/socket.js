// sockets/socket.js
// This file initializes Socket.io, manages real-time socket connections,
// checks user JWT tokens during handshakes, tracks online users, and sends notifications.

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io = null;

// Map to track online users
// Key: userId (String)
// Value: { name, role, socketIds: Set }
const onlineUsers = new Map();

/**
 * Initializes the Socket.io server.
 * @param {Object} httpServer - Node HTTP server instance wrapping the Express app
 */
function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  // Middleware: verify JWT token during handshake
  io.use((socket, next) => {
    // Client passes token in auth object: socket = io(..., { auth: { token } })
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error('Authentication error. Token required.'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Attach user details to the socket instance
      socket.user = decoded;
      next();
    } catch (err) {
      return next(new Error('Authentication error. Invalid or expired token.'));
    }
  });

  // Handle new connections
  io.on('connection', (socket) => {
    const { id: userId, name, role } = socket.user;
    const socketId = socket.id;

    console.log(`🔌 User connected: ${name} (${role}) | Socket: ${socketId}`);

    // Track online user
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, {
        name,
        role,
        socketIds: new Set(),
      });
    }
    onlineUsers.get(userId).socketIds.add(socketId);

    // If support agent connects, join the 'support' room
    if (role === 'SUPPORT') {
      socket.join('support_room');
    }

    // Broadcast updated online list to support reps
    broadcastOnlineUsers();

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${name} | Socket: ${socketId}`);

      const userSession = onlineUsers.get(userId);
      if (userSession) {
        userSession.socketIds.delete(socketId);
        // If user has no more open tabs/sockets, remove them from online list
        if (userSession.socketIds.size === 0) {
          onlineUsers.delete(userId);
        }
      }

      // Broadcast updated online list to support reps
      broadcastOnlineUsers();
    });
  });

  return io;
}

/**
 * Returns the active Socket.io instance.
 */
function getIO() {
  if (!io) {
    throw new Error('Socket.io has not been initialized. Call initSocket first.');
  }
  return io;
}

/**
 * Helper to emit a real-time event to a specific user (sends to all active sockets/tabs).
 * @param {string} userId - ID of the user to receive the event
 * @param {string} event - event name like "request:updated" or "comment:new"
 * @param {Object} data - event payload
 */
function sendToUser(userId, event, data) {
  const userSession = onlineUsers.get(userId);
  if (userSession && io) {
    userSession.socketIds.forEach((socketId) => {
      io.to(socketId).emit(event, data);
    });
    return true;
  }
  return false; // user is offline
}

/**
 * Broadcasts the updated online users list to all active support agents.
 */
function broadcastOnlineUsers() {
  if (!io) return;

  const supportList = [];
  const studentList = [];

  // Compile list of online users
  for (const [userId, userInfo] of onlineUsers.entries()) {
    const item = { id: userId, name: userInfo.name, role: userInfo.role };
    if (userInfo.role === 'SUPPORT') {
      supportList.push(item);
    } else {
      studentList.push(item);
    }
  }

  const payload = {
    support: supportList,
    students: studentList,
    totalOnline: onlineUsers.size,
  };

  // Emit only to sockets in the support room
  io.to('support_room').emit('users:online', payload);
}

module.exports = {
  initSocket,
  getIO,
  sendToUser,
  onlineUsers,
};

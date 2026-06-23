import React, { createContext, useEffect, useState, useContext } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    let socketInstance = null;

    // Only establish WebSocket connection if the user is logged in
    if (user) {
      const token = localStorage.getItem('token');
      const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

      socketInstance = io(socketUrl, {
        auth: { token },
        transports: ['websocket'], // Force WebSocket transport for better reliability and performance
      });

      socketInstance.on('connect', () => {
        console.log(`🔌 WebSocket connected for user: ${user.name}`);
      });

      socketInstance.on('disconnect', (reason) => {
        console.log(`🔌 WebSocket disconnected. Reason: ${reason}`);
      });

      setSocket(socketInstance);
    } else {
      // Disconnect socket if there is no user session
      setSocket(null);
    }

    // Clean up connections on component unmount or user change
    return () => {
      if (socketInstance) {
        console.log('🔌 Cleaning up WebSocket connection');
        socketInstance.disconnect();
      }
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}

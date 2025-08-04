import React, { createContext, useContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import socketService from '../services/socketService';
import { User } from '../types';

interface SocketContextType {
  socket: Socket | null;
  connectSocket: () => Promise<void>;
  disconnectSocket: () => void;
  joinRoom: (roomId: string, user: User) => void;
  leaveRoom: (roomId: string, userId: string) => void;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connectSocket: async () => {},
  disconnectSocket: () => {},
  joinRoom: () => {},
  leaveRoom: () => {},
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    return () => {
      disconnectSocket();
    };
  }, []);

  const connectSocket = async () => {
    try {
      const socketInstance = await socketService.connect();
      setSocket(socketInstance);
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to connect to socket:', error);
      setIsConnected(false);
    }
  };

  const disconnectSocket = () => {
    socketService.disconnect();
    setSocket(null);
    setIsConnected(false);
  };

  const joinRoom = (roomId: string, user: User) => {
    socketService.joinRoom(roomId, user);
  };

  const leaveRoom = (roomId: string, userId: string) => {
    socketService.leaveRoom(roomId, userId);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connectSocket,
        disconnectSocket,
        joinRoom,
        leaveRoom,
        isConnected,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
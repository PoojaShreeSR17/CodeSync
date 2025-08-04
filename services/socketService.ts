import { io, Socket } from 'socket.io-client';
import { ChatMessageEvent, CodeChangeEvent, Room, RoomJoinEvent, User } from '../types';

// Get the WebContainer hostname from the current URL
const hostname = window.location.hostname;
const isWebContainer = hostname.includes('webcontainer-api.io');

// Determine the socket URL based on the environment
const SOCKET_URL = isWebContainer
  ? `${window.location.protocol}//${hostname}`  // Use the WebContainer URL
  : 'http://localhost:3001';                    // Use localhost for local development

class SocketService {
  private socket: Socket | null = null;
  private connected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  connect(): Promise<Socket> {
    return new Promise((resolve, reject) => {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        path: '/socket.io/',
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 2000,
        timeout: 20000,
        withCredentials: true,
        autoConnect: true,
        reconnection: true
      });

      this.socket.on('connect', () => {
        this.connected = true;
        this.reconnectAttempts = 0;
        console.log('Connected to socket server');
        resolve(this.socket as Socket);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          this.socket?.close();
          reject(new Error('Maximum reconnection attempts reached'));
        }
        
        if (!this.connected) {
          reject(error);
        }
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        this.connected = false;
        
        if (reason === 'io server disconnect') {
          // Server initiated disconnect, try to reconnect
          this.socket?.connect();
        }
      });

      this.socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.reconnectAttempts = 0;
    }
  }

  joinRoom(roomId: string, user: User): void {
    if (this.socket) {
      this.socket.emit('join_room', { roomId, user });
    }
  }

  leaveRoom(roomId: string, userId: string): void {
    if (this.socket) {
      this.socket.emit('leave_room', { roomId, userId });
    }
  }

  sendCodeChange(roomId: string, userId: string, code: string, language: string): void {
    if (this.socket) {
      this.socket.emit('code_change', { roomId, userId, code, language });
    }
  }

  sendChatMessage(messageEvent: ChatMessageEvent): void {
    if (this.socket) {
      this.socket.emit('chat_message', messageEvent);
    }
  }

  onCodeChange(callback: (data: CodeChangeEvent) => void): void {
    if (this.socket) {
      this.socket.on('code_change', callback);
    }
  }

  onUserJoin(callback: (data: { room: Room; user: User }) => void): void {
    if (this.socket) {
      this.socket.on('user_joined', callback);
    }
  }

  onUserLeave(callback: (data: { room: Room; userId: string }) => void): void {
    if (this.socket) {
      this.socket.on('user_left', callback);
    }
  }

  onChatMessage(callback: (data: ChatMessageEvent) => void): void {
    if (this.socket) {
      this.socket.on('chat_message', callback);
    }
  }

  removeAllListeners(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

export default new SocketService();
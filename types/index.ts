export interface User {
  id: string;
  name: string;
  color: string;
}

export interface Message {
  id: string;
  userId: string;
  userName: string;
  userColor: string;
  text: string;
  timestamp: number;
}

export interface Room {
  id: string;
  name: string;
  language: string;
  users: User[];
}

export type Language = {
  id: string;
  name: string;
  extension: string;
};

export interface CodeChangeEvent {
  roomId: string;
  userId: string;
  code: string;
  language: string;
}

export interface RoomJoinEvent {
  roomId: string;
  user: User;
}

export interface ChatMessageEvent {
  roomId: string;
  message: Message;
}
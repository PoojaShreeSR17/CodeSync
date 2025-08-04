import React from 'react';
import { Message } from '../../types';

interface ChatMessageProps {
  message: Message;
  isCurrentUser: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isCurrentUser }) => {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className={`mb-2 ${
        isCurrentUser ? 'ml-auto' : 'mr-auto'
      }`}
    >
      <div
        className={`max-w-[85%] rounded-lg px-3 py-2 ${
          isCurrentUser
            ? 'bg-blue-600 text-white ml-auto'
            : 'bg-gray-700 text-gray-200'
        }`}
      >
        {!isCurrentUser && (
          <div className="flex items-center gap-1 mb-1">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: message.userColor }}
            />
            <span className="text-xs font-medium">{message.userName}</span>
          </div>
        )}
        <p className="text-sm break-words">{message.text}</p>
      </div>
      <div
        className={`text-xs text-gray-400 mt-1 ${
          isCurrentUser ? 'text-right' : 'text-left'
        }`}
      >
        {formatTime(message.timestamp)}
      </div>
    </div>
  );
};

export default ChatMessage;
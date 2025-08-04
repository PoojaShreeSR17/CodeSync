import React, { useEffect, useRef, useState } from 'react';
import { nanoid } from 'nanoid';
import { Message, User } from '../../types';
import ChatMessage from './ChatMessage';
import { Send } from 'lucide-react';

interface ChatPanelProps {
  messages: Message[];
  currentUser: User | null;
  onSendMessage: (message: string) => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  currentUser,
  onSendMessage,
}) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && currentUser) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-sm font-medium text-gray-400 mb-2">Chat</h3>
      <div className="flex-1 overflow-y-auto p-2 bg-gray-800 rounded-md mb-2">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-4">
            No messages yet
          </div>
        ) : (
          <div>
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                isCurrentUser={currentUser?.id === message.userId}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};

export default ChatPanel;
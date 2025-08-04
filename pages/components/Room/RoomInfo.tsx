import React from 'react';
import { Copy, Check, Users } from 'lucide-react';
import { Room } from '../../types';

interface RoomInfoProps {
  room: Room | null;
  roomLink: string;
}

const RoomInfo: React.FC<RoomInfoProps> = ({ room, roomLink }) => {
  const [copied, setCopied] = React.useState(false);

  const copyRoomLink = () => {
    navigator.clipboard.writeText(roomLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!room) return null;

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-4 shadow-md">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-white">{room.name || 'Untitled Room'}</h2>
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <Users size={16} />
          <span>{room.users.length}</span>
        </div>
      </div>
      <div className="flex items-center mt-3">
        <input
          type="text"
          readOnly
          value={roomLink}
          className="bg-gray-900 text-gray-300 px-3 py-2 rounded-l-md text-sm flex-1 border border-gray-700 focus:outline-none"
        />
        <button
          onClick={copyRoomLink}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-r-md transition-colors"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-2">
        Share this link with others to collaborate
      </p>
    </div>
  );
};

export default RoomInfo;
import React from 'react';
import { User } from '../../types';

interface UserListProps {
  users: User[];
  currentUserId?: string;
}

const UserList: React.FC<UserListProps> = ({ users, currentUserId }) => {
  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium text-gray-400 mb-2">Connected Users</h3>
      <div className="space-y-2">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center gap-2 p-2 rounded-md bg-gray-800 hover:bg-gray-750 transition-colors"
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: user.color }}
            />
            <span className="text-sm text-gray-200 truncate">
              {user.name}
              {user.id === currentUserId && ' (you)'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserList;
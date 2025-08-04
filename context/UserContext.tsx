import React, { createContext, useContext, useState } from 'react';
import { nanoid } from 'nanoid';
import { User } from '../types';

interface UserContextType {
  currentUser: User | null;
  setUserName: (name: string) => void;
  clearUser: () => void;
}

const UserContext = createContext<UserContextType>({
  currentUser: null,
  setUserName: () => {},
  clearUser: () => {},
});

export const useUser = () => useContext(UserContext);

// Array of colors for user identifiers
const USER_COLORS = [
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F97316', // Orange
  '#14B8A6', // Teal
  '#22C55E', // Green
  '#EAB308', // Yellow
  '#EF4444', // Red
];

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const setUserName = (name: string) => {
    const randomColor = USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
    setCurrentUser({
      id: nanoid(8),
      name: name || `User-${nanoid(4)}`,
      color: randomColor,
    });
  };

  const clearUser = () => {
    setCurrentUser(null);
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        setUserName,
        clearUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
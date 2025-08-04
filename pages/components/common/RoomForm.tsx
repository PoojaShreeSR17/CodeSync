import React, { useState } from 'react';
import { DEFAULT_LANGUAGE, LANGUAGE_OPTIONS } from '../../utils/languageOptions';
import { Language } from '../../types';

interface RoomFormProps {
  onSubmit: (roomName: string, language: Language) => void;
  buttonText: string;
}

const RoomForm: React.FC<RoomFormProps> = ({ onSubmit, buttonText }) => {
  const [roomName, setRoomName] = useState('');
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(roomName, language);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="roomName" className="block text-sm font-medium text-gray-300 mb-1">
          Room Name (optional)
        </label>
        <input
          type="text"
          id="roomName"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder="My Awesome Project"
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        />
      </div>
      
      <div>
        <label htmlFor="language" className="block text-sm font-medium text-gray-300 mb-1">
          Language
        </label>
        <select
          id="language"
          value={language.id}
          onChange={(e) => {
            const selected = LANGUAGE_OPTIONS.find((lang) => lang.id === e.target.value);
            if (selected) {
              setLanguage(selected);
            }
          }}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        >
          {LANGUAGE_OPTIONS.map((lang) => (
            <option key={lang.id} value={lang.id}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>
      
      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50"
      >
        {buttonText}
      </button>
    </form>
  );
};

export default RoomForm;
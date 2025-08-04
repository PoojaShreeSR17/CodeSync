import React, { useState } from 'react';

interface UserFormProps {
  onSubmit: (userName: string) => void;
  buttonText: string;
}

const UserForm: React.FC<UserFormProps> = ({ onSubmit, buttonText }) => {
  const [userName, setUserName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(userName);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="userName" className="block text-sm font-medium text-gray-300 mb-1">
          Your Name
        </label>
        <input
          type="text"
          id="userName"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="John Doe"
          required
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        />
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

export default UserForm;
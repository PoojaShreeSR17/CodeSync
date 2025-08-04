import React from 'react';
import { Link } from 'react-router-dom';
import { Code, GitMerge } from 'lucide-react';

interface HeaderProps {
  showHomeLink?: boolean;
}

const Header: React.FC<HeaderProps> = ({ showHomeLink = true }) => {
  return (
    <header className="bg-gray-900 border-b border-gray-800">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center text-blue-500">
            <Code size={24} className="mr-1" />
            <GitMerge size={20} />
          </div>
          <h1 className="text-xl font-bold text-white">CodeSync</h1>
        </div>
        
        {showHomeLink && (
          <Link
            to="/"
            className="text-sm text-gray-300 hover:text-white transition-colors py-1 px-3 rounded-md hover:bg-gray-800"
          >
            Home
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
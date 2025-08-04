import React from 'react';

const EditorSkeleton: React.FC = () => {
  return (
    <div className="h-full w-full bg-gray-900 animate-pulse rounded-md p-4">
      <div className="space-y-2">
        {Array.from({ length: 10 }).map((_, index) => (
          <div
            key={index}
            className="h-4 bg-gray-800 rounded"
            style={{ width: `${Math.floor(Math.random() * 80) + 20}%` }}
          />
        ))}
      </div>
    </div>
  );
};

export default EditorSkeleton;
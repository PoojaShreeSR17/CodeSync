import React from 'react';
import { Terminal } from 'lucide-react';

interface Output {
  id: number;
  timestamp: string;
  code: string;
  language: string;
  result: string;
  error: string | null;
  success?: boolean;
}

interface OutputPanelProps {
  outputs: Output[];
}

const OutputPanel: React.FC<OutputPanelProps> = ({ outputs }) => {
  return (
    <div className="h-full flex flex-col bg-gray-900 rounded-md border border-gray-700">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-700">
        <Terminal size={16} className="text-gray-400" />
        <h3 className="text-sm font-medium text-gray-300">Output</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
        {outputs.length === 0 ? (
          <div className="text-gray-500 text-center py-4">
            No output yet. Run your code to see results here.
          </div>
        ) : (
          <div className="space-y-4">
            {outputs.map(output => (
              <div key={output.id} className="mb-2">
                {/* Remove or comment out the code display */}
                {/* <pre className="text-xs text-gray-400">{output.code}</pre> */}
                <pre className="text-sm text-green-400">{output.result}</pre>
                {output.error && (
                  <pre className="text-sm text-red-400">{output.error}</pre>
                )}
                <div className="text-xs text-gray-500">{output.timestamp}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OutputPanel;

// server/server.js
// (simulatePythonOutput function removed as it was unused)
// src/components/Editor/CodeEditor.tsx
import React, { useEffect, useRef, useState } from 'react';
import Editor, { OnChange } from '@monaco-editor/react';
import { Language } from '../../types';

interface CodeEditorProps {
  code: string;
  language: Language;
  // roomId: string; // Removed unused prop
  onChange: (newCode: string) => void;
  onCursorChange?: (position: { line: number; column: number }) => void;
  theme: 'vs-dark' | 'light';
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  language,
  onChange,
  onCursorChange,
  theme
}) => {
  const editorRef = useRef<any>(null);
  const [internalCode, setInternalCode] = useState<string>(code);

  // const monaco = useMonaco();

  // Keep local state in sync when `code` changes externally
  useEffect(() => {
    setInternalCode(code);
  }, [code]);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;

    editor.onDidChangeCursorPosition((e: any) => {
      const position = e.position;
      if (onCursorChange) {
        onCursorChange({ line: position.lineNumber, column: position.column });
      }
    });
  };

  const handleEditorChange: OnChange = (value) => {
    if (typeof value === 'string') {
      setInternalCode(value);
      onChange(value); // Send value to parent
    }
  };

  return (
    <Editor
      height="100%"
      defaultLanguage={language.id}
      language={language.id}
      value={internalCode}
      theme={theme}
      onMount={handleEditorDidMount}
      onChange={handleEditorChange}
      options={{
        fontSize: 14,
        minimap: { enabled: false },
        automaticLayout: true,
      }}
    />
  );
};

export default CodeEditor;

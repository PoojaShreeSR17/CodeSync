import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { nanoid } from 'nanoid';
import CodeEditor from '../components/Editor/CodeEditor';
import OutputPanel from '../components/Output/OutputPanel';
import LanguageSelector from '../components/Editor/LanguageSelector';
import { Room as RoomType, Message, Language } from '../types';
import { DEFAULT_LANGUAGE, getLanguageById } from '../utils/languageOptions';
import { useSocket } from '../context/SocketContext';
import { useUser } from '../context/UserContext';
import RoomInfo from '../components/Room/RoomInfo';
import UserList from '../components/Room/UserList';
import ChatPanel from '../components/Room/ChatPanel';
import Header from '../components/common/Header';
import { MessageSquare, Play, Sun, Moon } from 'lucide-react';
import { useMonaco } from '@monaco-editor/react';

interface LocationState {
  isNewRoom?: boolean;
  roomName?: string;
  language?: Language;
}

interface Output {
  id: number;
  timestamp: string;
  code: string;
  language: string;
  result: string;
  error: string | null;
}

const Room: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  const { connectSocket, joinRoom, leaveRoom, socket, isConnected } = useSocket();
  const { currentUser } = useUser();

  const [room, setRoom] = useState<RoomType | null>(null);
  const [code, setCode] = useState<string>('// Start coding here...');
  const [language, setLanguage] = useState<Language>(state?.language || DEFAULT_LANGUAGE);
  const [messages, setMessages] = useState<Message[]>([]);
  const [outputs, setOutputs] = useState<Output[]>([]);
  const [theme, setTheme] = useState<'vs-dark' | 'light'>('vs-dark');
  const [lastCodeUpdate, setLastCodeUpdate] = useState<Date | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const codeRef = useRef(code);
  const currentUserRef = useRef(currentUser);

  const roomLink = `${window.location.origin}/room/${roomId}`;
  useEffect(() => {
    if (!socket) return;

    const handleCodeChange = ({ code: newCode, language: newLang, userId }: any) => {
      if (userId === currentUserRef.current?.id) return;
      if (newCode !== codeRef.current) {
        setCode(newCode);
      }
      if (newLang) {
        setLanguage((prev) =>
          prev.id !== newLang
            ? getLanguageById(newLang)
            : prev
        );
      }
    };

    // Listen for code changes from other users
    socket.on('code_change', handleCodeChange);

    socket.on('execution_result', (output: Output) => {
      setOutputs(prev => [...prev, output]);
    });

    socket.on('output_state', ({ outputs: roomOutputs }) => {
      setOutputs(roomOutputs);
    });

    // Listen for incoming chat messages from others
    socket.on('chat_message', ({ message }) => {
      setMessages(prev => [...prev, message]);
    });

    // Listen for user join/leave events to update room info
    socket.on('user_joined', ({ room }) => {
      setRoom(room);
    });
    socket.on('user_left', ({ room }) => {
      setRoom(room);
    });

    return () => {
      socket.off('code_change', handleCodeChange);
      socket.off('execution_result');
      socket.off('output_state');
      socket.off('chat_message');
      socket.off('user_joined');
      socket.off('user_left');
    };
  }, [socket, currentUser]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/', { replace: true });
      return;
    }

    const connectAndJoin = async () => {
      if (!isConnected) {
        await connectSocket();
      }

      if (roomId && currentUser) {
        if (state?.isNewRoom) {
          const newRoom: RoomType = {
            id: roomId,
            name: state.roomName || 'Untitled Room',
            language: language.id,
            users: [currentUser],
          };
          setRoom(newRoom);
        }

        joinRoom(roomId, currentUser);
      }
    };

    connectAndJoin();

    return () => {
      if (roomId && currentUser) {
        leaveRoom(roomId, currentUser.id);
      }
    };
  }, [roomId, currentUser, isConnected]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    setLastCodeUpdate(new Date());
    if (socket && roomId && currentUser) {
      socket.emit('code_change', {
        roomId,
        userId: currentUser.id,
        code: newCode,
        language: language.id,
      });
    }
  };

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setRoom((prev) => (prev ? { ...prev, language: newLanguage.id } : null));
    if (socket && roomId && currentUser) {
      socket.emit('code_change', {
        roomId,
        userId: currentUser.id,
        code,
        language: newLanguage.id,
      });
    }
  };

  const handleCursorChange = (position: { line: number; column: number }) => {
    if (socket && currentUser) {
      socket.emit('cursor_update', {
        roomId,
        userId: currentUser.id,
        position,
      });
    }
  };

  const handleRunCode = () => {
    if (socket && roomId) {
      socket.emit('execute_code', {
        roomId,
        code,
        language: language.id,
      });
    }
  };

  const handleSendMessage = (text: string) => {
    if (!currentUser || !roomId) return;

    const newMessage: Message = {
      id: nanoid(),
      userId: currentUser.id,
      userName: currentUser.name,
      userColor: currentUser.color,
      text,
      timestamp: Date.now(),
    };

    // Do NOT setMessages here!
    if (socket) {
      socket.emit('chat_message', { roomId, message: newMessage });
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'vs-dark' ? 'light' : 'vs-dark');
  };

  const monaco = useMonaco();

  useEffect(() => {
    if (monaco && language.id === 'javascript') {
      monaco.languages.typescript.javascriptDefaults.addExtraLib(
        `
        declare var myGlobalFunction: () => void;
        `,
        'filename/myGlobal.d.ts'
      );
    }
  }, [monaco, language]);

  useEffect(() => {
    if (monaco && language.id === 'html') {
      monaco.languages.html.htmlDefaults.setOptions({
        suggest: { html5: true, angular1: false, ionic: false }
      });
    }
  }, [monaco, language]);

  if (!currentUser) {
    return null;
  }

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'vs-dark' ? 'theme-dark' : 'theme-light'}`}>
      <Header />

      <main className="flex-1 flex min-h-0 relative">
        {/* Sidebar */}
        {/* Mobile sidebar backdrop */}
        <div
          className={`fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity duration-300 md:hidden ${
            isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setIsSidebarOpen(false)}
        />
        <div
          className={`
            sidebar bg-gray-900 border-r border-gray-800 p-4 flex flex-col z-50
            fixed top-0 left-0 bottom-0 w-64 md:static md:w-64
            transition-transform duration-300
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            md:translate-x-0
          `}
        >
          {room && <RoomInfo room={room} roomLink={roomLink} />}
          {room && <UserList users={room.users} currentUserId={currentUser?.id} />}
          <div className="flex-1 mt-4">
            <ChatPanel
              messages={messages}
              currentUser={currentUser}
              onSendMessage={handleSendMessage}
            />
          </div>
        </div>

        {/* Editor Area */}
        <div className="editor-wrapper flex-1 flex flex-col min-w-0">
          <div className="bg-gray-800 border-b border-gray-700 p-2 sm:p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden p-2 hover:bg-gray-700 rounded-md"
                aria-label="Toggle sidebar"
              >
                <MessageSquare size={20} />
              </button>
              <LanguageSelector
                selectedLanguage={language}
                onChange={handleLanguageChange}
              />
              <button
                onClick={handleRunCode}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md transition-colors text-sm sm:text-base"
              >
                <Play size={16} />
                <span>Run</span>
              </button>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 hover:bg-gray-700 rounded-md"
                aria-label="Toggle theme"
              >
                {theme === 'vs-dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              {lastCodeUpdate && (
                <span className="text-xs text-gray-400 hidden sm:inline">
                  Last update: {lastCodeUpdate.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>

          <div className="editor-content p-2 sm:p-4 flex-1 min-h-0">
            <div className="flex flex-col md:flex-row h-full gap-2 md:gap-4">
              <div className="flex-1 min-h-[200px]">
                <CodeEditor
                  code={code}
                  language={language}
                  onChange={handleCodeChange}
                  onCursorChange={handleCursorChange}
                  theme={theme}
                />
              </div>
              <div className="flex-1 min-h-[150px] max-h-[50vh] md:max-h-none">
                <OutputPanel outputs={outputs} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Room;
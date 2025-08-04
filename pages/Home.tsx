import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { nanoid } from 'nanoid';
import Header from '../components/common/Header';
import UserForm from '../components/common/UserForm';
import RoomForm from '../components/common/RoomForm';
import { Language } from '../types';
import { useUser } from '../context/UserContext';
import { Code, Users, UserPlus } from 'lucide-react';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, setUserName } = useUser();
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [formStep, setFormStep] = useState<'initial' | 'user' | 'room'>('initial');

  useEffect(() => {
    // If user is already set up and we're in a form step that requires a user,
    // we can skip the user form step
    if (currentUser && (formStep === 'user')) {
      if (isCreating) {
        setFormStep('room');
      } else if (isJoining) {
        handleJoinRoom(roomId);
      }
    }
  }, [currentUser, formStep, isCreating, isJoining, roomId]);

  const handleCreateRoom = (roomName: string, language: Language) => {
    const newRoomId = nanoid(10);
    navigate(`/room/${newRoomId}`, { 
      state: { 
        isNewRoom: true, 
        roomName, 
        language
      } 
    });
  };

  const handleJoinRoom = (roomIdToJoin: string) => {
    navigate(`/room/${roomIdToJoin}`);
  };

  const handleRoomIdInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoomId(e.target.value);
  };

  const handleUserFormSubmit = (name: string) => {
    setUserName(name);
    if (isCreating) {
      setFormStep('room');
    } else if (isJoining) {
      handleJoinRoom(roomId);
    }
  };

  const startCreatingRoom = () => {
    setIsCreating(true);
    setIsJoining(false);
    setFormStep(currentUser ? 'room' : 'user');
  };

  const startJoiningRoom = () => {
    setIsCreating(false);
    setIsJoining(true);
    setFormStep('user');
  };

  const resetForm = () => {
    setFormStep('initial');
    setIsCreating(false);
    setIsJoining(false);
    setRoomId('');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <Header showHomeLink={false} />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="flex items-center text-blue-500">
                  <Code size={36} className="mr-1" />
                </div>
              </div>
              <h1 className="text-2xl font-bold mb-2">CodeSync</h1>
              <p className="text-gray-400">Real-time collaborative code editor</p>
            </div>

            {formStep === 'initial' && (
              <div className="space-y-4">
                <button
                  onClick={startCreatingRoom}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md transition-colors"
                >
                  <Users size={20} />
                  <span>Create a Room</span>
                </button>
                
                <div className="relative flex items-center justify-center">
                  <div className="border-t border-gray-700 flex-grow"></div>
                  <span className="px-3 text-gray-500 text-sm">or</span>
                  <div className="border-t border-gray-700 flex-grow"></div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={roomId}
                      onChange={handleRoomIdInputChange}
                      placeholder="Enter Room ID"
                      className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-l-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => startJoiningRoom()}
                      disabled={!roomId}
                      className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-r-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <UserPlus size={20} />
                      <span>Join</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {formStep === 'user' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">
                    {isCreating ? 'Create a Room' : 'Join Room'}
                  </h2>
                  <p className="text-gray-400 text-sm">
                    First, let us know who you are
                  </p>
                </div>
                <UserForm
                  onSubmit={handleUserFormSubmit}
                  buttonText={isCreating ? 'Next' : 'Join Room'}
                />
                <button
                  onClick={resetForm}
                  className="mt-4 text-gray-400 text-sm hover:text-gray-300 transition-colors"
                >
                  ← Back
                </button>
              </div>
            )}

            {formStep === 'room' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">Room Settings</h2>
                  <p className="text-gray-400 text-sm">
                    Configure your new collaborative space
                  </p>
                </div>
                <RoomForm
                  onSubmit={handleCreateRoom}
                  buttonText="Create Room"
                />
                <button
                  onClick={resetForm}
                  className="mt-4 text-gray-400 text-sm hover:text-gray-300 transition-colors"
                >
                  ← Back
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
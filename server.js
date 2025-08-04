import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { setupWSConnection } from 'y-websocket/bin/utils.js'; // ✅ Correct import

const app = express();
const httpServer = createServer(app);

// Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  credentials: true
}));

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type']
  },
  transports: ['websocket', 'polling'],
  path: '/socket.io/',
  pingTimeout: 30000,
  pingInterval: 5000
});

// --- Yjs WebSocket setup (dynamic room support) ---
const wss = new WebSocketServer({ noServer: true });

httpServer.on('upgrade', (req, socket, head) => {
  const pathname = new URL(req.url, `http://${req.headers.host}`).pathname;

  if (pathname.startsWith('/collaboration')) {
    wss.handleUpgrade(req, socket, head, (ws) => {
      setupWSConnection(ws, req, { gc: true });
    });
  }
});

// --- In-memory data ---
const rooms = new Map();
const outputs = new Map();

// --- Code Execution Logic ---
const executeCode = async (code, language) => {
  try {
    let output = '';

    switch (language) {
      case 'javascript':
        try {
          const context = {
            console: {
              log: (...args) => {
                output += args.map(arg => {
                  if (arg === undefined) return 'undefined';
                  if (arg === null) return 'null';
                  if (typeof arg === 'object') {
                    try {
                      return JSON.stringify(arg, null, 2);
                    } catch (e) {
                      return String(arg);
                    }
                  }
                  return String(arg);
                }).join(' ') + '\n';
              },
              error: (...args) => {
                output += 'Error: ' + args.map(arg =>
                  typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                ).join(' ') + '\n';
              },
              warn: (...args) => {
                output += 'Warning: ' + args.map(arg =>
                  typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                ).join(' ') + '\n';
              }
            },
            setTimeout,
            clearTimeout,
            setInterval,
            clearInterval,
            Promise,
            Array,
            Object,
            String,
            Number,
            Boolean,
            Date,
            Math,
            JSON,
            Error
          };

          const wrappedCode = `
            (async () => {
              try {
                ${code}
              } catch (e) {
                console.error(e);
              }
            })()
          `;

          const fn = new Function(...Object.keys(context), wrappedCode);
          await fn(...Object.values(context));

          return {
            success: true,
            result: output || 'Code executed successfully (no output)',
            error: null
          };
        } catch (e) {
          return { success: false, result: '', error: e.message };
        }

      case 'python': {
        function simulatePythonOutput(code) {
          // Very basic simulation: extract print("...") content
          const printMatch = code.match(/print\((["'`])(.*?)\1\)/);
          const fakeOutput = printMatch ? printMatch[2] : '';
          return { success: true, result: fakeOutput, error: null };
        }

        const sim = simulatePythonOutput(code);
        return { success: sim.success, result: sim.result, error: sim.error };
      }

      default:
        return { success: true, result: `Execution simulation for ${language}:\n${code}`, error: null };
    }
  } catch (error) {
    return { success: false, result: '', error: error.message };
  }
};

// --- Socket.IO Events ---
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
   socket.on('code_change', ({ roomId, userId, code, language }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.code = code;
      room.language = language;
      // Broadcast to all users except sender
      socket.to(roomId).emit('code_change', { roomId, userId, code, language });
    }
  });

   socket.on('join_room', ({ roomId, user }) => {
    socket.join(roomId);

    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        users: [],
        code: '',
        language: 'javascript',
        cursors: new Map(),
        history: []
      });
      outputs.set(roomId, []);
    }

    const room = rooms.get(roomId);
    room.users.push(user);
    room.cursors.set(user.id, { line: 0, column: 0 });

    io.to(roomId).emit('user_joined', {
      room: {
        ...room,
        id: roomId,
        cursors: Array.from(room.cursors.entries())
      },
      user
    });

    // Send current code and language to the newly joined user
    socket.emit('code_change', {
      roomId,
      userId: user.id,
      code: room.code,
      language: room.language,
    });

    socket.emit('output_state', {
      roomId,
      outputs: outputs.get(roomId)
    });
  });

  socket.on('cursor_update', ({ roomId, userId, position }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.cursors.set(userId, position);
      socket.to(roomId).emit('cursor_update', { userId, position });
    }
  });

  socket.on('execute_code', async ({ roomId, code, language }) => {
    const { success, result, error } = await executeCode(code, language);

    const output = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      code,
      language,
      result,
      error,
      success
    };

    const roomOutputs = outputs.get(roomId) || [];
    roomOutputs.push(output);
    outputs.set(roomId, roomOutputs);

    io.to(roomId).emit('execution_result', output);
  });

  socket.on('leave_room', ({ roomId, userId }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.users = room.users.filter(user => user.id !== userId);
      room.cursors.delete(userId);
      io.to(roomId).emit('user_left', {
        room: {
          ...room,
          id: roomId,
          cursors: Array.from(room.cursors.entries())
        },
        userId
      });
    }
    socket.leave(roomId);
  });

  socket.on('chat_message', ({ roomId, message }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.history.push(message);
      io.to(roomId).emit('chat_message', { roomId, message });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    rooms.forEach((room, roomId) => {
      const user = room.users.find(u => u.socketId === socket.id);
      if (user) {
        room.users = room.users.filter(u => u.socketId !== socket.id);
        room.cursors.delete(user.id);
        io.to(roomId).emit('user_left', {
          room: {
            ...room,
            id: roomId,
            cursors: Array.from(room.cursors.entries())
          },
          userId: user.id
        });
      }
    });
  });
});

// --- Start Server ---
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

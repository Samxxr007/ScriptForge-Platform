import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { prisma } from '../db.js';

interface UserPresence {
  socketId: string;
  userId: string;
  name: string;
  avatar: string | null;
  role: string;
  sceneId?: string;
  cursor?: { x: number; y: number; lineIndex?: number };
}

export function setupWebSocket(httpServer: HttpServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Room presence map: documentId -> Map<socketId, UserPresence>
  const roomPresence = new Map<string, Map<string, UserPresence>>();

  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    try {
      const decoded = jwt.verify(token as string, config.jwtSecret) as { id: string; email: string };
      (socket as any).userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket: Socket) => {
    const userId = (socket as any).userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, avatar: true, roleTitle: true },
    });

    if (!user) {
      socket.disconnect();
      return;
    }

    let currentDocumentId: string | null = null;

    // Join Document Room
    socket.on('document:join', async ({ documentId, role }: { documentId: string; role?: string }) => {
      currentDocumentId = documentId;
      socket.join(`doc:${documentId}`);

      if (!roomPresence.has(documentId)) {
        roomPresence.set(documentId, new Map());
      }

      const presence: UserPresence = {
        socketId: socket.id,
        userId: user.id,
        name: user.name,
        avatar: user.avatar,
        role: role || user.roleTitle || 'Writer',
      };

      roomPresence.get(documentId)!.set(socket.id, presence);

      // Broadcast updated presence to all clients in document room
      const activeUsers = Array.from(roomPresence.get(documentId)!.values());
      io.to(`doc:${documentId}`).emit('presence:update', activeUsers);
    });

    // Real-time cursor update
    socket.on('cursor:update', ({ documentId, cursor, sceneId }: { documentId: string; cursor: any; sceneId?: string }) => {
      if (roomPresence.has(documentId) && roomPresence.get(documentId)!.has(socket.id)) {
        const p = roomPresence.get(documentId)!.get(socket.id)!;
        p.cursor = cursor;
        p.sceneId = sceneId;
      }
      socket.to(`doc:${documentId}`).emit('cursor:update', {
        userId: user.id,
        name: user.name,
        cursor,
        sceneId,
      });
    });

    // Real-time document delta broadcast
    socket.on('document:update', ({ documentId, delta, content }: { documentId: string; delta?: any; content?: string }) => {
      socket.to(`doc:${documentId}`).emit('document:update', {
        userId: user.id,
        delta,
        content,
      });
    });

    // Broadcast new comment / suggestion
    socket.on('comment:create', ({ documentId, comment }: { documentId: string; comment: any }) => {
      io.to(`doc:${documentId}`).emit('comment:create', comment);
    });

    socket.on('suggestion:create', ({ documentId, suggestion }: { documentId: string; suggestion: any }) => {
      io.to(`doc:${documentId}`).emit('suggestion:create', suggestion);
    });

    // Disconnect cleanup
    socket.on('disconnect', () => {
      if (currentDocumentId && roomPresence.has(currentDocumentId)) {
        roomPresence.get(currentDocumentId)!.delete(socket.id);
        const activeUsers = Array.from(roomPresence.get(currentDocumentId)!.values());
        io.to(`doc:${currentDocumentId}`).emit('presence:update', activeUsers);
      }
    });
  });

  return io;
}

import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { prisma } from './config/prisma.js';

export const setupSocketIO = (httpServer: HttpServer) => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`⚡ Socket connected: ${socket.id}`);

    // Join user room
    socket.on('join', (userId: string | number) => {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined room user_${userId}`);
    });

    // Send private chat message
    socket.on('sendMessage', async (data: { senderId: number; receiverId: number; content: string }) => {
      try {
        const { senderId, receiverId, content } = data;
        if (!senderId || !receiverId || !content) return;

        const message = await prisma.chatMessage.create({
          data: {
            senderId,
            receiverId,
            content,
          },
          include: {
            sender: { select: { id: true, name: true, email: true } },
            receiver: { select: { id: true, name: true, email: true } },
          },
        });

        // Broadcast to receiver & sender
        io.to(`user_${receiverId}`).emit('newMessage', message);
        io.to(`user_${senderId}`).emit('newMessage', message);
      } catch (err) {
        console.error('Socket message error:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

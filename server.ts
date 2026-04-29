import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  const PORT = 3000;

  // Real-time Messaging Logic
  const activeUsers = new Map();

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join", (userData) => {
      activeUsers.set(socket.id, { ...userData, socketId: socket.id });
      io.emit("users_update", Array.from(activeUsers.values()));
    });

    socket.on("send_message", (messageData) => {
      // Logic for broadcasting: if target is a channel, broadcast to all
      // If direct, send to specific socket (simulated here for demo)
      io.emit("new_message", {
        ...messageData,
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
      });
    });

    socket.on("disconnect", () => {
      activeUsers.delete(socket.id);
      io.emit("users_update", Array.from(activeUsers.values()));
      console.log("User disconnected");
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

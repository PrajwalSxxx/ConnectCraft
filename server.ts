import express from "express";
import path from "path";
import fs from "fs";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";

const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "src", "db.json");

// Types for Simulated MySQL database
interface User {
  user_id: number;
  name: string;
  username: string;
  email: string;
  password_hash: string;
  profile_picture: string;
  status: "ONLINE" | "OFFLINE";
  last_seen: string;
  created_at: string;
}

interface Message {
  message_id: number;
  sender_id: number;
  receiver_id: number | null; // null for broadcast, negative or positive for groups/users
  group_id: number | null;
  message: string;
  message_type: "TEXT" | "IMAGE" | "DOCUMENT";
  file_path: string | null;
  timestamp: string;
}

interface Group {
  group_id: number;
  group_name: string;
  created_by: number;
  created_at: string;
}

interface GroupMember {
  group_id: number;
  user_id: number;
}

interface ChatLog {
  log_id: number;
  user_id: number;
  activity: string;
  timestamp: string;
}

interface Database {
  users: User[];
  messages: Message[];
  groups: Group[];
  group_members: GroupMember[];
  chat_logs: ChatLog[];
}

// Ensure database file exists with seed data
function initializeDatabase(): Database {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(data);
    } catch (e) {
      console.error("Failed to read database, creating new one.", e);
    }
  }

  const initialDB: Database = {
    users: [
      {
        user_id: 1,
        name: "Alice Smith",
        username: "alice",
        email: "alice@connectcraft.com",
        password_hash: "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918", // "pass123" SHA256 hashed
        profile_picture: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150",
        status: "OFFLINE",
        last_seen: new Date(Date.now() - 3600000).toISOString(),
        created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
      },
      {
        user_id: 2,
        name: "Bob Jones",
        username: "bob",
        email: "bob@connectcraft.com",
        password_hash: "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918", // "pass123"
        profile_picture: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150",
        status: "OFFLINE",
        last_seen: new Date(Date.now() - 1200000).toISOString(),
        created_at: new Date(Date.now() - 9 * 86400000).toISOString(),
      },
      {
        user_id: 3,
        name: "Charlie Brown",
        username: "charlie",
        email: "charlie@connectcraft.com",
        password_hash: "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918", // "pass123"
        profile_picture: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&h=150",
        status: "OFFLINE",
        last_seen: new Date(Date.now() - 600000).toISOString(),
        created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
      },
    ],
    messages: [
      {
        message_id: 1,
        sender_id: 1,
        receiver_id: null,
        group_id: 1,
        message: "Hello everyone! Welcome to ConnectCraft group discussion.",
        message_type: "TEXT",
        file_path: null,
        timestamp: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        message_id: 2,
        sender_id: 2,
        receiver_id: null,
        group_id: 1,
        message: "Hi Alice, the server socket is fully responsive and database connections are stable.",
        message_type: "TEXT",
        file_path: null,
        timestamp: new Date(Date.now() - 7100000).toISOString(),
      },
    ],
    groups: [
      {
        group_id: 1,
        group_name: "Java Core Architects",
        created_by: 1,
        created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
      },
    ],
    group_members: [
      { group_id: 1, user_id: 1 },
      { group_id: 1, user_id: 2 },
      { group_id: 1, user_id: 3 },
    ],
    chat_logs: [
      {
        log_id: 1,
        user_id: 1,
        activity: "Database initialized, default admin group 'Java Core Architects' established.",
        timestamp: new Date(Date.now() - 10 * 86400000).toISOString(),
      },
    ],
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(initialDB, null, 2), "utf-8");
  return initialDB;
}

let db = initializeDatabase();

function saveDatabase() {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
}

// Java-style logs buffer
interface JavaServerLog {
  timestamp: string;
  level: "INFO" | "WARNING" | "SEVERE";
  message: string;
}

const serverLogs: JavaServerLog[] = [
  {
    timestamp: new Date(Date.now() - 60000).toISOString(),
    level: "INFO",
    message: "Initializing ConnectCraft Socket Server v1.0...",
  },
  {
    timestamp: new Date(Date.now() - 55000).toISOString(),
    level: "INFO",
    message: "Connecting to MySQL Database 'jdbc:mysql://localhost:3306/connectcraft_chat'...",
  },
  {
    timestamp: new Date(Date.now() - 50000).toISOString(),
    level: "INFO",
    message: "HikariCP Database connection pool created successfully. Active connections: 10.",
  },
  {
    timestamp: new Date(Date.now() - 45000).toISOString(),
    level: "INFO",
    message: "ChatServer started. ServerSocket bound to port 8080. Awaiting clients...",
  },
];

function addServerLog(message: string, level: "INFO" | "WARNING" | "SEVERE" = "INFO") {
  const log: JavaServerLog = {
    timestamp: new Date().toISOString(),
    level,
    message,
  };
  serverLogs.push(log);
  if (serverLogs.length > 200) serverLogs.shift();
  // Broadcast to all websocket listeners
  broadcastToAllWebSockets({
    type: "server:log",
    payload: log,
  });
}

// Active connections (simulating Java threads)
interface SimulatedThread {
  threadId: string;
  userId: number | null;
  username: string | null;
  ip: string;
  connectedAt: string;
}

const activeThreads = new Map<string, SimulatedThread>();

// WebSocket client registry
interface WSClient {
  ws: WebSocket;
  threadId: string;
  userId: number | null;
  username: string | null;
}

const wsClients = new Set<WSClient>();

function broadcastToAllWebSockets(data: any) {
  const payload = JSON.stringify(data);
  wsClients.forEach((client) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(payload);
    }
  });
}

// SHA256 helper for password hashing simulation
function sha256(str: string): string {
  // A simple deterministic hash helper
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(6, "0") + "fakehash" + str.length;
}

async function startApp() {
  const app = express();
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  const httpServer = createServer(app);

  // Setup file system mappings to serve actual mock files
  const tempUploadDir = path.join(process.cwd(), "src", "uploads");
  if (!fs.existsSync(tempUploadDir)) {
    fs.mkdirSync(tempUploadDir, { recursive: true });
  }

  app.use("/uploads", express.static(tempUploadDir));

  // --- API Endpoints ---

  // Database status and raw query simulator
  app.get("/api/db-status", (req, res) => {
    res.json({
      databaseName: "connectcraft_chat",
      host: "localhost",
      port: 3306,
      tables: {
        users: db.users.length,
        messages: db.messages.length,
        groups: db.groups.length,
        group_members: db.group_members.length,
        chat_logs: db.chat_logs.length,
      },
    });
  });

  app.get("/api/db-tables", (req, res) => {
    res.json(db);
  });

  // Run mock SQL queries! Let's build a parser for SELECT, INSERT, etc.
  app.post("/api/db-query", (req, res) => {
    const { query } = req.body;
    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Invalid query string" });
    }

    const cleanQuery = query.trim().replace(/;$/, "");
    addServerLog(`Executing SQL Query: "${cleanQuery}" via Admin Console`, "INFO");

    try {
      if (/^select/i.test(cleanQuery)) {
        if (/from\s+users/i.test(cleanQuery)) {
          return res.json({ success: true, columns: Object.keys(db.users[0] || {}), rows: db.users });
        }
        if (/from\s+messages/i.test(cleanQuery)) {
          return res.json({ success: true, columns: Object.keys(db.messages[0] || {}), rows: db.messages });
        }
        if (/from\s+groups/i.test(cleanQuery)) {
          return res.json({ success: true, columns: Object.keys(db.groups[0] || {}), rows: db.groups });
        }
        if (/from\s+group_members/i.test(cleanQuery)) {
          return res.json({ success: true, columns: Object.keys(db.group_members[0] || {}), rows: db.group_members });
        }
        if (/from\s+chat_logs/i.test(cleanQuery)) {
          return res.json({ success: true, columns: Object.keys(db.chat_logs[0] || {}), rows: db.chat_logs });
        }
        return res.status(400).json({ error: "Table not found. Supported tables: users, messages, groups, group_members, chat_logs" });
      }

      if (/^insert\s+into\s+chat_logs/i.test(cleanQuery)) {
        const log_id = db.chat_logs.length + 1;
        const newLog: ChatLog = {
          log_id,
          user_id: 1,
          activity: "Custom SQL Log Entry",
          timestamp: new Date().toISOString(),
        };
        db.chat_logs.push(newLog);
        saveDatabase();
        return res.json({ success: true, affectedRows: 1, lastInsertId: log_id });
      }

      return res.status(400).json({ error: "Unsupported query. The MySQL console supports 'SELECT * FROM <table_name>' read-only or 'INSERT INTO chat_logs' operations in this simulation." });
    } catch (err: any) {
      return res.status(500).json({ error: "MySQL Syntax Error: " + err.message });
    }
  });

  // Upload endpoint for file sharing
  app.post("/api/upload", (req, res) => {
    const { name, type, data, senderId } = req.body;
    if (!name || !data) {
      return res.status(400).json({ error: "Missing upload parameters" });
    }

    try {
      const buffer = Buffer.from(data, "base64");
      const filename = `${Date.now()}_${name.replace(/[^a-zA-Z0-9_.]/g, "")}`;
      const filepath = path.join(tempUploadDir, filename);
      fs.writeFileSync(filepath, buffer);

      const fileUrl = `/uploads/${filename}`;
      addServerLog(`File uploaded: ${name} (${type}), stored at ${fileUrl}`, "INFO");

      return res.json({ success: true, fileUrl, filename });
    } catch (e: any) {
      console.error("Upload error", e);
      return res.status(500).json({ error: e.message });
    }
  });

  // Get Server Status, logs, and simulated threads
  app.get("/api/server-stats", (req, res) => {
    res.json({
      port: 8080,
      status: "RUNNING",
      uptime: process.uptime(),
      logs: serverLogs,
      threads: Array.from(activeThreads.values()),
      connectionCount: activeThreads.size,
    });
  });

  // Get full java source code files list
  app.get("/api/java-files", async (req, res) => {
    const javaDir = path.join(process.cwd(), "java-project");
    const filesList: { path: string; name: string; content: string }[] = [];

    function walk(dir: string, base: string) {
      if (!fs.existsSync(dir)) return;
      const list = fs.readdirSync(dir);
      list.forEach((file) => {
        const fullPath = path.join(dir, file);
        const relPath = path.join(base, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
          walk(fullPath, relPath);
        } else {
          // Skip binaries or metadata if any
          if (file.endsWith(".java") || file.endsWith(".xml") || file.endsWith(".sql") || file.endsWith(".md")) {
            const content = fs.readFileSync(fullPath, "utf-8");
            filesList.push({
              path: relPath,
              name: file,
              content,
            });
          }
        }
      });
    }

    walk(javaDir, "");
    res.json(filesList);
  });

  // WebSocket Server setup on same port
  const wss = new WebSocketServer({ noServer: true });

  httpServer.on("upgrade", (request, socket, head) => {
    const pathname = request.url;
    if (pathname === "/ws") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  wss.on("connection", (ws) => {
    const threadId = "CC-SocketThread-" + Math.floor(1000 + Math.random() * 9000);
    const ip = "127.0.0.1:" + Math.floor(49152 + Math.random() * 16383);

    addServerLog(`Socket Accept: Server Accepted socket connection on thread ${threadId} from IP: ${ip}`, "INFO");

    const client: WSClient = {
      ws,
      threadId,
      userId: null,
      username: null,
    };

    wsClients.add(client);

    // Initial Thread Registration
    activeThreads.set(threadId, {
      threadId,
      userId: null,
      username: null,
      ip,
      connectedAt: new Date().toISOString(),
    });

    // Notify client of their assigned Java thread ID
    ws.send(JSON.stringify({
      type: "server:thread_assigned",
      payload: { threadId, ip },
    }));

    // Send latest DB status & messages
    ws.send(JSON.stringify({
      type: "server:sync_db",
      payload: db,
    }));

    ws.on("message", (rawMessage) => {
      try {
        const event = JSON.parse(rawMessage.toString());
        const { type, payload } = event;

        switch (type) {
          case "client:register": {
            const { name, username, email, password, profile_picture } = payload;
            addServerLog(`Client Request [${threadId}]: REGISTER user "${username}"`, "INFO");

            // Check if username already exists
            const exists = db.users.some(u => u.username === username);
            if (exists) {
              ws.send(JSON.stringify({
                type: "server:register_response",
                payload: { success: false, error: "Username already exists!" }
              }));
              addServerLog(`Registration Failed [${threadId}]: Username "${username}" is already taken`, "WARNING");
              break;
            }

            const newUser: User = {
              user_id: db.users.length + 1,
              name,
              username,
              email,
              password_hash: sha256(password),
              profile_picture: profile_picture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150",
              status: "OFFLINE",
              last_seen: new Date().toISOString(),
              created_at: new Date().toISOString(),
            };

            db.users.push(newUser);

            // Create activity log
            const logId = db.chat_logs.length + 1;
            db.chat_logs.push({
              log_id: logId,
              user_id: newUser.user_id,
              activity: `Registered user account: ${username}`,
              timestamp: new Date().toISOString(),
            });

            saveDatabase();
            addServerLog(`Registration Success [${threadId}]: Created UID ${newUser.user_id} for "${username}"`, "INFO");

            ws.send(JSON.stringify({
              type: "server:register_response",
              payload: { success: true, user: newUser }
            }));

            // Broadcast updated database
            broadcastToAllWebSockets({
              type: "server:sync_db",
              payload: db,
            });
            break;
          }

          case "client:login": {
            const { username, password } = payload;
            addServerLog(`Client Request [${threadId}]: LOGIN user "${username}"`, "INFO");

            const hash = sha256(password);
            const user = db.users.find(u => u.username === username && u.password_hash === hash);

            if (!user) {
              ws.send(JSON.stringify({
                type: "server:login_response",
                payload: { success: false, error: "Invalid username or password" }
              }));
              addServerLog(`Login Failed [${threadId}]: Auth failed for "${username}"`, "WARNING");
              break;
            }

            // Update user status
            user.status = "ONLINE";
            user.last_seen = new Date().toISOString();

            // Bind user to thread and client
            client.userId = user.user_id;
            client.username = user.username;

            const threadInfo = activeThreads.get(threadId);
            if (threadInfo) {
              threadInfo.userId = user.user_id;
              threadInfo.username = user.username;
            }

            // Create activity log
            db.chat_logs.push({
              log_id: db.chat_logs.length + 1,
              user_id: user.user_id,
              activity: `Logged in to server on thread ${threadId}`,
              timestamp: new Date().toISOString(),
            });

            saveDatabase();
            addServerLog(`Login Success [${threadId}]: User "${username}" authenticated. Binding thread to UID ${user.user_id}.`, "INFO");

            ws.send(JSON.stringify({
              type: "server:login_response",
              payload: { success: true, user }
            }));

            // Broadcast user online status
            broadcastToAllWebSockets({
              type: "server:user_status",
              payload: { user_id: user.user_id, status: "ONLINE" }
            });

            // Sync Database
            broadcastToAllWebSockets({
              type: "server:sync_db",
              payload: db,
            });
            break;
          }

          case "client:logout": {
            if (client.userId) {
              const user = db.users.find(u => u.user_id === client.userId);
              if (user) {
                user.status = "OFFLINE";
                user.last_seen = new Date().toISOString();

                db.chat_logs.push({
                  log_id: db.chat_logs.length + 1,
                  user_id: user.user_id,
                  activity: `Logged out from server (closed thread ${threadId})`,
                  timestamp: new Date().toISOString(),
                });

                addServerLog(`Logout [${threadId}]: User "${user.username}" disconnected gracefully.`, "INFO");
              }

              client.userId = null;
              client.username = null;

              const threadInfo = activeThreads.get(threadId);
              if (threadInfo) {
                threadInfo.userId = null;
                threadInfo.username = null;
              }

              saveDatabase();

              broadcastToAllWebSockets({
                type: "server:sync_db",
                payload: db,
              });
            }
            break;
          }

          case "client:message": {
            const { sender_id, receiver_id, group_id, message, message_type, file_path } = payload;
            const msgId = db.messages.length + 1;

            const newMsg: Message = {
              message_id: msgId,
              sender_id,
              receiver_id: receiver_id || null,
              group_id: group_id || null,
              message,
              message_type: message_type || "TEXT",
              file_path: file_path || null,
              timestamp: new Date().toISOString(),
            };

            db.messages.push(newMsg);
            saveDatabase();

            const sender = db.users.find(u => u.user_id === sender_id);
            const targetType = group_id ? `Group ${group_id}` : `User ${receiver_id}`;
            addServerLog(`Message [${threadId}]: "${sender?.username}" -> ${targetType}: "${message.substring(0, 30)}${message.length > 30 ? "..." : ""}"`, "INFO");

            // Broadcast message to all connected clients
            broadcastToAllWebSockets({
              type: "server:message",
              payload: newMsg,
            });
            break;
          }

          case "client:typing": {
            const { user_id, target_id, group_id, is_typing } = payload;
            // Broadcast to other websockets
            broadcastToAllWebSockets({
              type: "server:typing",
              payload: { user_id, target_id, group_id, is_typing },
            });
            break;
          }

          case "client:create_group": {
            const { group_name, created_by, members } = payload;
            const groupId = db.groups.length + 1;

            const newGroup: Group = {
              group_id: groupId,
              group_name,
              created_by,
              created_at: new Date().toISOString(),
            };

            db.groups.push(newGroup);

            // Add creator as member
            db.group_members.push({ group_id: groupId, user_id: created_by });

            // Add other members
            if (Array.isArray(members)) {
              members.forEach((uid: number) => {
                if (uid !== created_by) {
                  db.group_members.push({ group_id: groupId, user_id: uid });
                }
              });
            }

            db.chat_logs.push({
              log_id: db.chat_logs.length + 1,
              user_id: created_by,
              activity: `Created chat group "${group_name}" (GID: ${groupId})`,
              timestamp: new Date().toISOString(),
            });

            saveDatabase();
            addServerLog(`Group Created [${threadId}]: "${group_name}" (GID: ${groupId}) by UID ${created_by}`, "INFO");

            broadcastToAllWebSockets({
              type: "server:sync_db",
              payload: db,
            });
            break;
          }

          case "client:update_profile": {
            const { user_id, name, email, profile_picture } = payload;
            const user = db.users.find(u => u.user_id === user_id);
            if (user) {
              user.name = name;
              user.email = email;
              if (profile_picture) user.profile_picture = profile_picture;

              db.chat_logs.push({
                log_id: db.chat_logs.length + 1,
                user_id,
                activity: `Updated profile coordinates`,
                timestamp: new Date().toISOString(),
              });

              saveDatabase();
              addServerLog(`Profile Updated [${threadId}]: UID ${user_id} updated details`, "INFO");

              broadcastToAllWebSockets({
                type: "server:sync_db",
                payload: db,
              });
            }
            break;
          }

          case "client:clear_chat": {
            const { user_id, target_id, group_id } = payload;
            // In a simple simulation, we'll delete messages matching the sender and receiver
            if (group_id) {
              db.messages = db.messages.filter(m => m.group_id !== group_id);
              addServerLog(`Database: Cleared messages for group ${group_id} by UID ${user_id}`, "INFO");
            } else if (target_id) {
              db.messages = db.messages.filter(m => 
                !(m.sender_id === user_id && m.receiver_id === target_id) &&
                !(m.sender_id === target_id && m.receiver_id === user_id)
              );
              addServerLog(`Database: Cleared private chat between UID ${user_id} and ${target_id}`, "INFO");
            }
            saveDatabase();
            broadcastToAllWebSockets({
              type: "server:sync_db",
              payload: db,
            });
            break;
          }

          case "client:kick_user": {
            const { sender_id, target_user_id } = payload;
            // Admin removes a user connection
            let threadKilled = "";
            for (const [tId, clientSession] of activeThreads.entries()) {
              if (clientSession.userId === target_user_id) {
                threadKilled = tId;
                break;
              }
            }

            if (threadKilled) {
              // Find the ws client and close it or send force logout
              wsClients.forEach((client) => {
                if (client.threadId === threadKilled) {
                  client.ws.send(JSON.stringify({
                    type: "server:force_logout",
                    payload: { reason: "Kicked by Admin" }
                  }));
                  client.ws.close();
                }
              });

              addServerLog(`Admin: Kicked UID ${target_user_id} from thread ${threadKilled}`, "SEVERE");
            }
            break;
          }
        }
      } catch (err) {
        console.error("WS Parse error", err);
      }
    });

    ws.on("close", () => {
      addServerLog(`Socket Disconnect: Closed connection on thread ${threadId}`, "INFO");
      activeThreads.delete(threadId);

      // Set user status offline if logged in
      if (client.userId) {
        const user = db.users.find(u => u.user_id === client.userId);
        if (user) {
          user.status = "OFFLINE";
          user.last_seen = new Date().toISOString();
          saveDatabase();

          broadcastToAllWebSockets({
            type: "server:sync_db",
            payload: db,
          });
        }
      }

      wsClients.delete(client);
    });
  });

  // --- Serve Frontend via Vite or Static Files ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startApp().catch((err) => {
  console.error("Failed to start full stack application", err);
});

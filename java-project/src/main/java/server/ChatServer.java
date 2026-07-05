package server;

import database.DatabaseConnection;
import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;
import java.sql.Connection;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class ChatServer {
    private static final int PORT = 8080;
    
    // Thread-safe map storing active ClientHandlers mapped by username
    private static final Map<String, ClientHandler> activeClients = Collections.synchronizedMap(new HashMap<>());
    
    // Thread pool to manage client connections efficiently
    private static final ExecutorService threadPool = Executors.newCachedThreadPool();

    public static void main(String[] args) {
        System.out.println("====================================================");
        System.out.println("   CONNECTCRAFT CENTRAL MULTI-CLIENT CHAT SERVER   ");
        System.out.println("====================================================");
        System.out.println("[ChatServer] Loading dependencies...");

        // Verify Database connection
        try (Connection conn = DatabaseConnection.getConnection()) {
            System.out.println("[ChatServer] Connection to MySQL Database succeeded.");
        } catch (Exception e) {
            System.err.println("[ChatServer] CRITICAL: MySQL database is unreachable. Verify connection settings.");
            e.printStackTrace();
        }

        try (ServerSocket serverSocket = new ServerSocket(PORT)) {
            System.out.println("[ChatServer] ServerSocket established successfully.");
            System.out.println("[ChatServer] Listening for client requests on port " + PORT + "...");

            // Main server socket connection acceptance loop
            while (!serverSocket.isClosed()) {
                Socket clientSocket = serverSocket.accept();
                System.out.println("[ChatServer] Connection accepted from remote host: " + clientSocket.getRemoteSocketAddress());
                
                // Spawn a new client handler thread
                ClientHandler handler = new ClientHandler(clientSocket);
                threadPool.execute(handler);
            }
        } catch (IOException e) {
            System.err.println("[ChatServer] ServerSocket exception: " + e.getMessage());
        } finally {
            shutdownServer();
        }
    }

    public static void registerClient(String username, ClientHandler handler) {
        activeClients.put(username, handler);
        System.out.println("[ChatServer] Client connected: " + username + " (Total active connections: " + activeClients.size() + ")");
        broadcastStatusUpdate(username, "ONLINE");
    }

    public static void unregisterClient(String username) {
        if (username != null) {
            activeClients.remove(username);
            System.out.println("[ChatServer] Client disconnected: " + username + " (Total active connections: " + activeClients.size() + ")");
            broadcastStatusUpdate(username, "OFFLINE");
        }
    }

    public static ClientHandler getClient(String username) {
        return activeClients.get(username);
    }

    public static Map<String, ClientHandler> getActiveClients() {
        return activeClients;
    }

    public static void broadcastMessage(String sender, String msgJson) {
        synchronized (activeClients) {
            for (Map.Entry<String, ClientHandler> entry : activeClients.entrySet()) {
                // Send to all clients except the sender
                if (!entry.getKey().equalsIgnoreCase(sender)) {
                    entry.getValue().sendMessage(msgJson);
                }
            }
        }
    }

    public static void sendDirectMessage(String recipient, String msgJson) {
        ClientHandler recipientHandler = activeClients.get(recipient);
        if (recipientHandler != null) {
            recipientHandler.sendMessage(msgJson);
        }
    }

    private static void broadcastStatusUpdate(String username, String status) {
        String payload = "{\"type\":\"user_status\",\"username\":\"" + username + "\",\"status\":\"" + status + "\"}";
        broadcastMessage(username, payload);
    }

    private static void shutdownServer() {
        System.out.println("[ChatServer] Initiating server shutdown process...");
        threadPool.shutdown();
        DatabaseConnection.closePool();
        System.out.println("[ChatServer] Resources cleaned up. Off.");
    }
}

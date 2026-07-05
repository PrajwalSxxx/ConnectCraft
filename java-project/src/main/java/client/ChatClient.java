package client;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import models.User;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.Socket;

public class ChatClient {
    private static final String HOST = "localhost";
    private static final int PORT = 8080;
    
    private Socket socket;
    private BufferedReader reader;
    private BufferedWriter writer;
    private User currentUser;
    private final Gson gson = new Gson();
    private ClientMessageListener listener;

    public interface ClientMessageListener {
        void onMessageReceived(JsonObject json);
        void onDisconnected();
    }

    public ChatClient() {}

    public boolean connect(ClientMessageListener msgListener) {
        try {
            this.socket = new Socket(HOST, PORT);
            this.reader = new BufferedReader(new InputStreamReader(socket.getInputStream()));
            this.writer = new BufferedWriter(new OutputStreamWriter(socket.getOutputStream()));
            this.listener = msgListener;

            // Spawn background thread to read socket streams from ServerSocket
            Thread readThread = new Thread(new IncomingStreamReader());
            readThread.start();
            return true;
        } catch (IOException e) {
            System.err.println("[ChatClient] Connection failed: " + e.getMessage());
            return false;
        }
    }

    public void sendRequest(String type, JsonObject payload) {
        try {
            JsonObject request = new JsonObject();
            request.addProperty("type", type);
            // Append payload values
            payload.entrySet().forEach(entry -> request.add(entry.getKey(), entry.getValue()));

            writer.write(gson.toJson(request));
            writer.newLine();
            writer.flush();
        } catch (IOException e) {
            System.err.println("[ChatClient] Error sending request: " + e.getMessage());
            disconnect();
        }
    }

    public void disconnect() {
        try {
            if (writer != null) {
                JsonObject logout = new JsonObject();
                logout.addProperty("type", "logout");
                writer.write(gson.toJson(logout));
                writer.newLine();
                writer.flush();
            }

            if (reader != null) reader.close();
            if (writer != null) writer.close();
            if (socket != null && !socket.isClosed()) socket.close();
        } catch (IOException e) {
            System.err.println("[ChatClient] Disconnect cleanup error: " + e.getMessage());
        } finally {
            if (listener != null) {
                listener.onDisconnected();
            }
        }
    }

    public User getCurrentUser() { return currentUser; }
    public void setCurrentUser(User user) { this.currentUser = user; }

    private class IncomingStreamReader implements Runnable {
        @Override
        public void run() {
            String serverMessage;
            try {
                while (socket.isConnected() && (serverMessage = reader.readLine()) != null) {
                    JsonObject json = gson.fromJson(serverMessage, JsonObject.class);
                    if (listener != null) {
                        listener.onMessageReceived(json);
                    }
                }
            } catch (IOException e) {
                System.out.println("[ChatClient] Read thread closed: " + e.getMessage());
            } finally {
                disconnect();
            }
        }
    }
}

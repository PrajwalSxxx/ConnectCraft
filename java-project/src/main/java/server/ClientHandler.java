package server;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import database.UserDAO;
import database.MessageDAO;
import models.User;
import models.Message;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.Socket;

public class ClientHandler implements Runnable {
    private final Socket socket;
    private BufferedReader reader;
    private BufferedWriter writer;
    private String username;
    private User authenticatedUser;
    private final UserDAO userDAO = new UserDAO();
    private final MessageDAO messageDAO = new MessageDAO();
    private final Gson gson = new Gson();

    public ClientHandler(Socket socket) {
        this.socket = socket;
        try {
            this.reader = new BufferedReader(new InputStreamReader(socket.getInputStream()));
            this.writer = new BufferedWriter(new OutputStreamWriter(socket.getOutputStream()));
        } catch (IOException e) {
            System.err.println("[ClientHandler] Streams setup error: " + e.getMessage());
            closeEverything();
        }
    }

    @Override
    public void run() {
        String clientRequest;
        try {
            // Read incoming requests from client socket in a separate thread
            while (socket.isConnected() && (clientRequest = reader.readLine()) != null) {
                processRequest(clientRequest);
            }
        } catch (IOException e) {
            System.out.println("[ClientHandler] Communication error on " + (username != null ? username : "unauthenticated client") + ": " + e.getMessage());
        } finally {
            closeEverything();
        }
    }

    private void processRequest(String jsonString) {
        try {
            JsonObject json = gson.fromJson(jsonString, JsonObject.class);
            String type = json.get("type").getAsString();

            switch (type) {
                case "login":
                    handleLogin(json);
                    break;
                case "register":
                    handleRegister(json);
                    break;
                case "message":
                    handleMessage(json);
                    break;
                case "typing":
                    handleTyping(json);
                    break;
                case "logout":
                    closeEverything();
                    break;
            }
        } catch (Exception e) {
            System.err.println("[ClientHandler] Error parsing JSON client request: " + e.getMessage());
        }
    }

    private void handleLogin(JsonObject json) {
        String userStr = json.get("username").getAsString();
        String passStr = json.get("password").getAsString();

        User user = userDAO.loginUser(userStr, passStr);
        JsonObject response = new JsonObject();
        response.addProperty("type", "login_response");

        if (user != null) {
            this.username = user.getUsername();
            this.authenticatedUser = user;
            response.addProperty("success", true);
            response.addProperty("message", "Login successful!");
            response.add("user", gson.toJsonTree(user));

            sendMessage(gson.toJson(response));
            ChatServer.registerClient(username, this);
        } else {
            response.addProperty("success", false);
            response.addProperty("message", "Invalid username or password.");
            sendMessage(gson.toJson(response));
        }
    }

    private void handleRegister(JsonObject json) {
        String name = json.get("name").getAsString();
        String userStr = json.get("username").getAsString();
        String email = json.get("email").getAsString();
        String passStr = json.get("password").getAsString();

        User user = new User();
        user.setName(name);
        user.setUsername(userStr);
        user.setEmail(email);
        user.setPassword(passStr);

        boolean success = userDAO.registerUser(user);
        JsonObject response = new JsonObject();
        response.addProperty("type", "register_response");

        if (success) {
            response.addProperty("success", true);
            response.addProperty("message", "User registered successfully!");
        } else {
            response.addProperty("success", false);
            response.addProperty("message", "Registration failed. Username or email already exists.");
        }
        sendMessage(gson.toJson(response));
    }

    private void handleMessage(JsonObject json) {
        int senderId = json.get("sender_id").getAsInt();
        Integer receiverId = json.has("receiver_id") && !json.get("receiver_id").isJsonNull() ? json.get("receiver_id").getAsInt() : null;
        Integer groupId = json.has("group_id") && !json.get("group_id").isJsonNull() ? json.get("group_id").getAsInt() : null;
        String text = json.get("message").getAsString();
        String msgType = json.get("message_type").getAsString();
        String filePath = json.has("file_path") && !json.get("file_path").isJsonNull() ? json.get("file_path").getAsString() : null;

        Message message = new Message();
        message.setSenderId(senderId);
        message.setReceiverId(receiverId);
        message.setGroupId(groupId);
        message.setMessage(text);
        message.setMessageType(msgType);
        message.setFilePath(filePath);

        // Save to Database
        messageDAO.saveMessage(message);

        // Convert message to json for broadcasting
        JsonObject messageEvent = new JsonObject();
        messageEvent.addProperty("type", "message_received");
        messageEvent.add("message", gson.toJsonTree(message));
        String broadcastPayload = gson.toJson(messageEvent);

        if (groupId != null) {
            // Broadcast group message to all connected clients
            ChatServer.broadcastMessage(username, broadcastPayload);
        } else if (receiverId != null) {
            // Send direct message to receiver
            User receiver = userDAO.getUserById(receiverId);
            if (receiver != null) {
                ChatServer.sendDirectMessage(receiver.getUsername(), broadcastPayload);
            }
        }
    }

    private void handleTyping(JsonObject json) {
        String target = json.get("target_username").getAsString();
        boolean isTyping = json.get("is_typing").getAsBoolean();

        JsonObject response = new JsonObject();
        response.addProperty("type", "typing_indicator");
        response.addProperty("sender_username", username);
        response.addProperty("is_typing", isTyping);

        ChatServer.sendDirectMessage(target, gson.toJson(response));
    }

    public void sendMessage(String jsonMessage) {
        try {
            writer.write(jsonMessage);
            writer.newLine();
            writer.flush();
        } catch (IOException e) {
            System.err.println("[ClientHandler] Error sending message to " + username + ": " + e.getMessage());
            closeEverything();
        }
    }

    private void closeEverything() {
        ChatServer.unregisterClient(username);
        if (authenticatedUser != null) {
            userDAO.updateStatus(authenticatedUser.getUserId(), "OFFLINE");
            userDAO.logActivity(authenticatedUser.getUserId(), "Disconnected from server on thread closing.");
        }
        
        try {
            if (reader != null) reader.close();
            if (writer != null) writer.close();
            if (socket != null && !socket.isClosed()) socket.close();
        } catch (IOException e) {
            System.err.println("[ClientHandler] Cleanup error: " + e.getMessage());
        }
    }
}

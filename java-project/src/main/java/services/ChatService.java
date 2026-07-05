package services;

import database.MessageDAO;
import models.Message;
import java.util.List;

public class ChatService {
    private final MessageDAO messageDAO;

    public ChatService() {
        this.messageDAO = new MessageDAO();
    }

    public boolean sendMessage(int senderId, Integer receiverId, Integer groupId, String message, String messageType, String filePath) throws Exception {
        if (message == null || message.trim().isEmpty()) {
            throw new IllegalArgumentException("Cannot send an empty message!");
        }

        if (receiverId == null && groupId == null) {
            throw new IllegalArgumentException("A message must specify either a user recipient or a group!");
        }

        Message msg = new Message();
        msg.setSenderId(senderId);
        msg.setReceiverId(receiverId);
        msg.setGroupId(groupId);
        msg.setMessage(message.trim());
        msg.setMessageType(messageType);
        msg.setFilePath(filePath);

        boolean success = messageDAO.saveMessage(msg);
        if (!success) {
            throw new Exception("Failed to persist message in database.");
        }
        return true;
    }

    public List<Message> getPrivateChatHistory(int userA, int userB) {
        return messageDAO.getPrivateChatHistory(userA, userB);
    }

    public List<Message> getGroupChatHistory(int groupId) {
        return messageDAO.getGroupChatHistory(groupId);
    }

    public boolean clearChatHistory(int userId, Integer receiverId, Integer groupId) {
        return messageDAO.clearChatHistory(userId, receiverId, groupId);
    }
}

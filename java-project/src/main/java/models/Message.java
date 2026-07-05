package models;

import java.io.Serializable;
import java.sql.Timestamp;

public class Message implements Serializable {
    private static final long serialVersionUID = 1L;

    private int messageId;
    private int senderId;
    private Integer receiverId; // null for group
    private Integer groupId;    // null for 1-to-1
    private String message;
    private String messageType; // TEXT, IMAGE, DOCUMENT
    private String filePath;
    private Timestamp timestamp;

    public Message() {}

    public Message(int messageId, int senderId, Integer receiverId, Integer groupId, String message, String messageType, String filePath, Timestamp timestamp) {
        this.messageId = messageId;
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.groupId = groupId;
        this.message = message;
        this.messageType = messageType;
        this.filePath = filePath;
        this.timestamp = timestamp;
    }

    // Getters and Setters
    public int getMessageId() { return messageId; }
    public void setMessageId(int messageId) { this.messageId = messageId; }

    public int getSenderId() { return senderId; }
    public void setSenderId(int senderId) { this.senderId = senderId; }

    public Integer getReceiverId() { return receiverId; }
    public void setReceiverId(Integer receiverId) { this.receiverId = receiverId; }

    public Integer getGroupId() { return groupId; }
    public void setGroupId(Integer groupId) { this.groupId = groupId; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getMessageType() { return messageType; }
    public void setMessageType(String messageType) { this.messageType = messageType; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }

    public Timestamp getTimestamp() { return timestamp; }
    public void setTimestamp(Timestamp timestamp) { this.timestamp = timestamp; }
}

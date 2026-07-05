package database;

import models.Message;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class MessageDAO {

    public boolean saveMessage(Message msg) {
        String sql = "INSERT INTO messages (sender_id, receiver_id, group_id, message, message_type, file_path) VALUES (?, ?, ?, ?, ?, ?)";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            stmt.setInt(1, msg.getSenderId());
            if (msg.getReceiverId() != null) {
                stmt.setInt(2, msg.getReceiverId());
            } else {
                stmt.setNull(2, Types.INTEGER);
            }

            if (msg.getGroupId() != null) {
                stmt.setInt(3, msg.getGroupId());
            } else {
                stmt.setNull(3, Types.INTEGER);
            }

            stmt.setString(4, msg.getMessage());
            stmt.setString(5, msg.getMessageType());
            stmt.setString(6, msg.getFilePath());

            int rows = stmt.executeUpdate();
            if (rows > 0) {
                try (ResultSet rs = stmt.getGeneratedKeys()) {
                    if (rs.next()) {
                        msg.setMessageId(rs.getInt(1));
                    }
                }
                return true;
            }
        } catch (SQLException e) {
            System.err.println("[MessageDAO] Error saving message: " + e.getMessage());
        }
        return false;
    }

    public List<Message> getPrivateChatHistory(int userA, int userB) {
        List<Message> history = new ArrayList<>();
        String sql = "SELECT * FROM messages WHERE " +
                     "(sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) " +
                     "ORDER BY timestamp ASC";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, userA);
            stmt.setInt(2, userB);
            stmt.setInt(3, userB);
            stmt.setInt(4, userA);

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    history.add(mapResultSetToMessage(rs));
                }
            }
        } catch (SQLException e) {
            System.err.println("[MessageDAO] Error getting private history: " + e.getMessage());
        }
        return history;
    }

    public List<Message> getGroupChatHistory(int groupId) {
        List<Message> history = new ArrayList<>();
        String sql = "SELECT * FROM messages WHERE group_id = ? ORDER BY timestamp ASC";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, groupId);

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    history.add(mapResultSetToMessage(rs));
                }
            }
        } catch (SQLException e) {
            System.err.println("[MessageDAO] Error getting group history: " + e.getMessage());
        }
        return history;
    }

    public boolean clearChatHistory(int senderId, Integer receiverId, Integer groupId) {
        String sql;
        try (Connection conn = DatabaseConnection.getConnection()) {
            if (groupId != null) {
                sql = "DELETE FROM messages WHERE group_id = ?";
                try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                    stmt.setInt(1, groupId);
                    return stmt.executeUpdate() > 0;
                }
            } else if (receiverId != null) {
                sql = "DELETE FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)";
                try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                    stmt.setInt(1, senderId);
                    stmt.setInt(2, receiverId);
                    stmt.setInt(3, receiverId);
                    stmt.setInt(4, senderId);
                    return stmt.executeUpdate() > 0;
                }
            }
        } catch (SQLException e) {
            System.err.println("[MessageDAO] Error clearing history: " + e.getMessage());
        }
        return false;
    }

    private Message mapResultSetToMessage(ResultSet rs) throws SQLException {
        Message msg = new Message();
        msg.setMessageId(rs.getInt("message_id"));
        msg.setSenderId(rs.getInt("sender_id"));
        
        int rId = rs.getInt("receiver_id");
        msg.setReceiverId(rs.wasNull() ? null : rId);

        int gId = rs.getInt("group_id");
        msg.setGroupId(rs.wasNull() ? null : gId);

        msg.setMessage(rs.getString("message"));
        msg.setMessageType(rs.getString("message_type"));
        msg.setFilePath(rs.getString("file_path"));
        msg.setTimestamp(rs.getTimestamp("timestamp"));
        return msg;
    }
}

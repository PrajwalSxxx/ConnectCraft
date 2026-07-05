package database;

import models.User;
import java.sql.*;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.List;

public class UserDAO {

    // Helper to encrypt passwords using SHA-256
    public static String hashPassword(String password) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(password.getBytes());
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not found", e);
        }
    }

    public boolean registerUser(User user) {
        String sql = "INSERT INTO users (name, username, email, password, profile_picture) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            stmt.setString(1, user.getName());
            stmt.setString(2, user.getUsername());
            stmt.setString(3, user.getEmail());
            stmt.setString(4, hashPassword(user.getPassword()));
            stmt.setString(5, user.getProfilePicture());

            int rows = stmt.executeUpdate();
            if (rows > 0) {
                try (ResultSet rs = stmt.getGeneratedKeys()) {
                    if (rs.next()) {
                        user.setUserId(rs.getInt(1));
                    }
                }
                logActivity(user.getUserId(), "Registered account username: " + user.getUsername());
                return true;
            }
        } catch (SQLException e) {
            System.err.println("[UserDAO] Registration failed: " + e.getMessage());
        }
        return false;
    }

    public User loginUser(String username, String password) {
        String sql = "SELECT * FROM users WHERE username = ? AND password = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, username);
            stmt.setString(2, hashPassword(password));

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    User user = mapResultSetToUser(rs);
                    updateStatus(user.getUserId(), "ONLINE");
                    logActivity(user.getUserId(), "Logged in to client dashboard");
                    return user;
                }
            }
        } catch (SQLException e) {
            System.err.println("[UserDAO] Login query failed: " + e.getMessage());
        }
        return null;
    }

    public boolean updateProfile(User user) {
        String sql = "UPDATE users SET name = ?, email = ?, profile_picture = ? WHERE user_id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, user.getName());
            stmt.setString(2, user.getEmail());
            stmt.setString(3, user.getProfilePicture());
            stmt.setInt(4, user.getUserId());

            int affected = stmt.executeUpdate();
            if (affected > 0) {
                logActivity(user.getUserId(), "Updated user profile coordinates.");
                return true;
            }
        } catch (SQLException e) {
            System.err.println("[UserDAO] Profile update failed: " + e.getMessage());
        }
        return false;
    }

    public boolean updateStatus(int userId, String status) {
        String sql = "UPDATE users SET status = ?, last_seen = CURRENT_TIMESTAMP WHERE user_id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, status);
            stmt.setInt(2, userId);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("[UserDAO] Status update failed: " + e.getMessage());
        }
        return false;
    }

    public List<User> getAllUsers() {
        List<User> list = new ArrayList<>();
        String sql = "SELECT * FROM users ORDER BY username ASC";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            
            while (rs.next()) {
                list.add(mapResultSetToUser(rs));
            }
        } catch (SQLException e) {
            System.err.println("[UserDAO] Get all users failed: " + e.getMessage());
        }
        return list;
    }

    public User getUserById(int userId) {
        String sql = "SELECT * FROM users WHERE user_id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, userId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToUser(rs);
                }
            }
        } catch (SQLException e) {
            System.err.println("[UserDAO] Get user by ID failed: " + e.getMessage());
        }
        return null;
    }

    public void logActivity(int userId, String activity) {
        String sql = "INSERT INTO chat_logs (user_id, activity) VALUES (?, ?)";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, userId);
            stmt.setString(2, activity);
            stmt.executeUpdate();
        } catch (SQLException e) {
            System.err.println("[UserDAO] Logging failed: " + e.getMessage());
        }
    }

    private User mapResultSetToUser(ResultSet rs) throws SQLException {
        User user = new User();
        user.setUserId(rs.getInt("user_id"));
        user.setName(rs.getString("name"));
        user.setUsername(rs.getString("username"));
        user.setEmail(rs.getString("email"));
        user.setProfilePicture(rs.getString("profile_picture"));
        user.setStatus(rs.getString("status"));
        user.setLastSeen(rs.getTimestamp("last_seen"));
        user.setCreatedAt(rs.getTimestamp("created_at"));
        return user;
    }
}

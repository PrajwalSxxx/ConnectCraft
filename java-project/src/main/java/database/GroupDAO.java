package database;

import models.Group;
import models.User;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class GroupDAO {

    public boolean createGroup(Group group, List<Integer> memberUserIds) {
        String insertGroupSql = "INSERT INTO groups (group_name, created_by) VALUES (?, ?)";
        String insertMemberSql = "INSERT INTO group_members (group_id, user_id) VALUES (?, ?)";
        Connection conn = null;

        try {
            conn = DatabaseConnection.getConnection();
            conn.setAutoCommit(false); // Use TRANSACTION to guarantee atomic creation

            int groupId = -1;
            try (PreparedStatement stmt = conn.prepareStatement(insertGroupSql, Statement.RETURN_GENERATED_KEYS)) {
                stmt.setString(1, group.getGroupName());
                stmt.setInt(2, group.getCreatedBy());
                stmt.executeUpdate();

                try (ResultSet rs = stmt.getGeneratedKeys()) {
                    if (rs.next()) {
                        groupId = rs.getInt(1);
                        group.setGroupId(groupId);
                    }
                }
            }

            if (groupId != -1) {
                // Add members
                try (PreparedStatement stmt = conn.prepareStatement(insertMemberSql)) {
                    // Add creator
                    stmt.setInt(1, groupId);
                    stmt.setInt(2, group.getCreatedBy());
                    stmt.addBatch();

                    // Add rest
                    for (int uid : memberUserIds) {
                        if (uid != group.getCreatedBy()) {
                            stmt.setInt(1, groupId);
                            stmt.setInt(2, uid);
                            stmt.addBatch();
                        }
                    }
                    stmt.executeBatch();
                }
                conn.commit();
                return true;
            } else {
                conn.rollback();
            }

        } catch (SQLException e) {
            System.err.println("[GroupDAO] Create group transaction failed: " + e.getMessage());
            if (conn != null) {
                try { conn.rollback(); } catch (SQLException ex) { ex.printStackTrace(); }
            }
        } finally {
            if (conn != null) {
                try { conn.setAutoCommit(true); conn.close(); } catch (SQLException e) { e.printStackTrace(); }
            }
        }
        return false;
    }

    public List<Group> getGroupsForUser(int userId) {
        List<Group> list = new ArrayList<>();
        String sql = "SELECT g.* FROM groups g INNER JOIN group_members gm ON g.group_id = gm.group_id WHERE gm.user_id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, userId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Group group = new Group();
                    group.setGroupId(rs.getInt("group_id"));
                    group.setGroupName(rs.getString("group_name"));
                    group.setCreatedBy(rs.getInt("created_by"));
                    group.setCreatedAt(rs.getTimestamp("created_at"));
                    group.setMembers(getGroupMembers(group.getGroupId()));
                    list.add(group);
                }
            }
        } catch (SQLException e) {
            System.err.println("[GroupDAO] Error getting user groups: " + e.getMessage());
        }
        return list;
    }

    public List<User> getGroupMembers(int groupId) {
        List<User> members = new ArrayList<>();
        String sql = "SELECT u.* FROM users u INNER JOIN group_members gm ON u.user_id = gm.user_id WHERE gm.group_id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, groupId);
            try (ResultSet rs = stmt.executeQuery()) {
                UserDAO userDAO = new UserDAO();
                while (rs.next()) {
                    User user = new User();
                    user.setUserId(rs.getInt("user_id"));
                    user.setName(rs.getString("name"));
                    user.setUsername(rs.getString("username"));
                    user.setEmail(rs.getString("email"));
                    user.setProfilePicture(rs.getString("profile_picture"));
                    user.setStatus(rs.getString("status"));
                    user.setLastSeen(rs.getTimestamp("last_seen"));
                    members.add(user);
                }
            }
        } catch (SQLException e) {
            System.err.println("[GroupDAO] Error getting group members: " + e.getMessage());
        }
        return members;
    }

    public boolean addMemberToGroup(int groupId, int userId) {
        String sql = "INSERT INTO group_members (group_id, user_id) VALUES (?, ?)";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, groupId);
            stmt.setInt(2, userId);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("[GroupDAO] Add member failed: " + e.getMessage());
        }
        return false;
    }

    public boolean removeMemberFromGroup(int groupId, int userId) {
        String sql = "DELETE FROM group_members WHERE group_id = ? AND user_id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, groupId);
            stmt.setInt(2, userId);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("[GroupDAO] Remove member failed: " + e.getMessage());
        }
        return false;
    }
}

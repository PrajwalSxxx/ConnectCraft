package models;

import java.io.Serializable;
import java.sql.Timestamp;

public class User implements Serializable {
    private static final long serialVersionUID = 1L;

    private int userId;
    private String name;
    private String username;
    private String email;
    private String password;
    private String profilePicture;
    private String status;
    private Timestamp lastSeen;
    private Timestamp createdAt;

    public User() {}

    public User(int userId, String name, String username, String email, String password, String profilePicture, String status, Timestamp lastSeen, Timestamp createdAt) {
        this.userId = userId;
        this.name = name;
        this.username = username;
        this.email = email;
        this.password = password;
        this.profilePicture = profilePicture;
        this.status = status;
        this.lastSeen = lastSeen;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getProfilePicture() { return profilePicture; }
    public void setProfilePicture(String profilePicture) { this.profilePicture = profilePicture; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Timestamp getLastSeen() { return lastSeen; }
    public void setLastSeen(Timestamp lastSeen) { this.lastSeen = lastSeen; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    @Override
    public String toString() {
        return username + " (" + status + ")";
    }
}

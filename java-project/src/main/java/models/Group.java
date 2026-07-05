package models;

import java.io.Serializable;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

public class Group implements Serializable {
    private static final long serialVersionUID = 1L;

    private int groupId;
    private String groupName;
    private int createdBy;
    private Timestamp createdAt;
    private List<User> members = new ArrayList<>();

    public Group() {}

    public Group(int groupId, String groupName, int createdBy, Timestamp createdAt) {
        this.groupId = groupId;
        this.groupName = groupName;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public int getGroupId() { return groupId; }
    public void setGroupId(int groupId) { this.groupId = groupId; }

    public String getGroupName() { return groupName; }
    public void setGroupName(String groupName) { this.groupName = groupName; }

    public int getCreatedBy() { return createdBy; }
    public void setCreatedBy(int createdBy) { this.createdBy = createdBy; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    public List<User> getMembers() { return members; }
    public void setMembers(List<User> members) { this.members = members; }

    @Override
    public String toString() {
        return groupName + " (" + members.size() + " members)";
    }
}

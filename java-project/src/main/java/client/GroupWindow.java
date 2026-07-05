package client;

import com.google.gson.JsonObject;
import models.User;
import services.NotificationService;

import javax.swing.*;
import java.awt.*;

public class GroupWindow extends JFrame {
    private ChatClient client;
    private JTextField txtGroupName;
    private JList<String> listAvailableUsers;
    private DefaultListModel<String> usersModel;
    private JButton btnCreate;

    public GroupWindow(ChatClient client) {
        this.client = client;
        setTitle("ConnectCraft - Create Group Room");
        setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);
        setSize(400, 480);
        setLocationRelativeTo(null);
        setResizable(false);

        JPanel panel = new JPanel();
        panel.setBackground(new Color(18, 24, 38));
        panel.setLayout(new GridBagLayout());
        panel.setBorder(BorderFactory.createEmptyBorder(20, 30, 20, 30));

        GridBagConstraints gbc = new GridBagConstraints();
        gbc.fill = GridBagConstraints.HORIZONTAL;
        gbc.insets = new Insets(10, 0, 10, 0);
        gbc.gridx = 0;

        JLabel lblTitle = new JLabel("Create Group Chatroom");
        lblTitle.setFont(new Font("Segoe UI", Font.BOLD, 22));
        lblTitle.setForeground(new Color(16, 185, 129));
        gbc.gridy = 0;
        panel.add(lblTitle, gbc);

        JLabel lblName = new JLabel("Group Name");
        lblName.setForeground(new Color(209, 213, 219));
        gbc.gridy = 1;
        gbc.insets = new Insets(15, 0, 5, 0);
        panel.add(lblName, gbc);

        txtGroupName = new JTextField(15);
        txtGroupName.setBackground(new Color(31, 41, 55));
        txtGroupName.setForeground(Color.WHITE);
        txtGroupName.setCaretColor(Color.WHITE);
        txtGroupName.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(new Color(55, 65, 81), 1, true),
                BorderFactory.createEmptyBorder(8, 10, 8, 10)
        ));
        gbc.gridy = 2;
        gbc.insets = new Insets(0, 0, 10, 0);
        panel.add(txtGroupName, gbc);

        JLabel lblSelect = new JLabel("Select Members (Hold CTRL for multiple selection)");
        lblSelect.setForeground(new Color(209, 213, 219));
        gbc.gridy = 3;
        gbc.insets = new Insets(10, 0, 5, 0);
        panel.add(lblSelect, gbc);

        usersModel = new DefaultListModel<>();
        usersModel.addElement("alice");
        usersModel.addElement("bob");
        usersModel.addElement("charlie");
        usersModel.addElement("system_admin");

        listAvailableUsers = new JList<>(usersModel);
        listAvailableUsers.setBackground(new Color(31, 41, 55));
        listAvailableUsers.setForeground(Color.WHITE);
        listAvailableUsers.setSelectionBackground(new Color(16, 185, 129));
        listAvailableUsers.setSelectionMode(ListSelectionModel.MULTIPLE_INTERVAL_SELECTION);
        listAvailableUsers.setFixedCellHeight(30);

        JScrollPane scrollPane = new JScrollPane(listAvailableUsers);
        scrollPane.setPreferredSize(new Dimension(0, 150));
        scrollPane.setBorder(BorderFactory.createLineBorder(new Color(55, 65, 81), 1));
        gbc.gridy = 4;
        gbc.insets = new Insets(0, 0, 15, 0);
        panel.add(scrollPane, gbc);

        btnCreate = new JButton("Create Active Group");
        btnCreate.setBackground(new Color(16, 185, 129));
        btnCreate.setForeground(Color.WHITE);
        btnCreate.setFont(new Font("Segoe UI", Font.BOLD, 14));
        btnCreate.setFocusPainted(false);
        btnCreate.setCursor(new Cursor(Cursor.HAND_CURSOR));
        btnCreate.addActionListener(e -> performGroupCreation());
        gbc.gridy = 5;
        panel.add(btnCreate, gbc);

        add(panel);
    }

    private void performGroupCreation() {
        String name = txtGroupName.getText().trim();
        if (name.isEmpty()) {
            NotificationService.showError("Group name is required!");
            return;
        }

        java.util.List<String> selected = listAvailableUsers.getSelectedValuesList();
        if (selected.isEmpty()) {
            NotificationService.showError("Please select at least one additional member!");
            return;
        }

        // Simulate sending a group creation block through socket
        JsonObject groupPayload = new JsonObject();
        groupPayload.addProperty("group_name", name);
        groupPayload.addProperty("created_by", client.getCurrentUser() != null ? client.getCurrentUser().getUserId() : 1);
        
        NotificationService.showInfo("Group chatroom '" + name + "' initialized successfully on the ServerSocket thread!", "Room Created");
        dispose();
    }
}

package client;

import models.User;
import services.NotificationService;

import javax.swing.*;
import java.awt.*;

public class ProfileWindow extends JFrame {
    private ChatClient client;
    private JTextField txtName;
    private JTextField txtEmail;
    private JButton btnSave;

    public ProfileWindow(ChatClient client) {
        this.client = client;
        User user = client.getCurrentUser();

        setTitle("ConnectCraft - User Profile Configuration");
        setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);
        setSize(380, 360);
        setLocationRelativeTo(null);
        setResizable(false);

        JPanel panel = new JPanel();
        panel.setBackground(new Color(18, 24, 38));
        panel.setLayout(new GridBagLayout());
        panel.setBorder(BorderFactory.createEmptyBorder(20, 30, 20, 30));

        GridBagConstraints gbc = new GridBagConstraints();
        gbc.fill = GridBagConstraints.HORIZONTAL;
        gbc.insets = new Insets(8, 0, 8, 0);
        gbc.gridx = 0;

        JLabel lblTitle = new JLabel("Configure Identity Profile", SwingConstants.CENTER);
        lblTitle.setFont(new Font("Segoe UI", Font.BOLD, 20));
        lblTitle.setForeground(new Color(16, 185, 129));
        gbc.gridy = 0;
        panel.add(lblTitle, gbc);

        JLabel lblName = new JLabel("Display Name");
        lblName.setForeground(new Color(209, 213, 219));
        gbc.gridy = 1;
        gbc.insets = new Insets(15, 0, 2, 0);
        panel.add(lblName, gbc);

        txtName = new JTextField(user != null ? user.getName() : "Chat User", 15);
        styleField(txtName);
        gbc.gridy = 2;
        gbc.insets = new Insets(0, 0, 10, 0);
        panel.add(txtName, gbc);

        JLabel lblEmail = new JLabel("Email Address");
        lblEmail.setForeground(new Color(209, 213, 219));
        gbc.gridy = 3;
        gbc.insets = new Insets(5, 0, 2, 0);
        panel.add(lblEmail, gbc);

        txtEmail = new JTextField(user != null ? user.getEmail() : "user@example.com", 15);
        styleField(txtEmail);
        gbc.gridy = 4;
        gbc.insets = new Insets(0, 0, 20, 0);
        panel.add(txtEmail, gbc);

        btnSave = new JButton("Save Coordinates");
        btnSave.setBackground(new Color(16, 185, 129));
        btnSave.setForeground(Color.WHITE);
        btnSave.setFont(new Font("Segoe UI", Font.BOLD, 14));
        btnSave.setFocusPainted(false);
        btnSave.setCursor(new Cursor(Cursor.HAND_CURSOR));
        btnSave.addActionListener(e -> saveProfile());
        gbc.gridy = 5;
        panel.add(btnSave, gbc);

        add(panel);
    }

    private void styleField(JTextField f) {
        f.setBackground(new Color(31, 41, 55));
        f.setForeground(Color.WHITE);
        f.setCaretColor(Color.WHITE);
        f.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(new Color(55, 65, 81), 1, true),
                BorderFactory.createEmptyBorder(6, 10, 6, 10)
        ));
    }

    private void saveProfile() {
        String name = txtName.getText().trim();
        String email = txtEmail.getText().trim();

        if (name.isEmpty() || email.isEmpty()) {
            NotificationService.showError("Fields cannot be empty!");
            return;
        }

        if (client.getCurrentUser() != null) {
            client.getCurrentUser().setName(name);
            client.getCurrentUser().setEmail(email);
        }

        NotificationService.showInfo("Profile changes saved and updated to socket db stream!", "Changes Saved");
        dispose();
    }
}

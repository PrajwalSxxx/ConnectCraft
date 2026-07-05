package client;

import com.google.gson.JsonObject;
import services.NotificationService;

import javax.swing.*;
import java.awt.*;

public class RegisterForm extends JFrame {
    private JTextField txtName;
    private JTextField txtUsername;
    private JTextField txtEmail;
    private JPasswordField txtPassword;
    private JPasswordField txtConfirmPassword;
    private JButton btnRegister;
    private JButton btnBack;

    public RegisterForm() {
        setTitle("ConnectCraft - Create Account");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(440, 560);
        setLocationRelativeTo(null);
        setResizable(false);

        JPanel panel = new JPanel();
        panel.setBackground(new Color(18, 24, 38));
        panel.setLayout(new GridBagLayout());
        panel.setBorder(BorderFactory.createEmptyBorder(20, 40, 20, 40));

        GridBagConstraints gbc = new GridBagConstraints();
        gbc.fill = GridBagConstraints.HORIZONTAL;
        gbc.insets = new Insets(5, 0, 5, 0);
        gbc.gridx = 0;

        JLabel lblTitle = new JLabel("Join ConnectCraft", SwingConstants.CENTER);
        lblTitle.setFont(new Font("Segoe UI", Font.BOLD, 26));
        lblTitle.setForeground(new Color(16, 185, 129));
        gbc.gridy = 0;
        panel.add(lblTitle, gbc);

        JLabel lblSubtitle = new JLabel("Register to start real-time secure messaging", SwingConstants.CENTER);
        lblSubtitle.setFont(new Font("Segoe UI", Font.PLAIN, 11));
        lblSubtitle.setForeground(new Color(156, 163, 175));
        gbc.gridy = 1;
        panel.add(lblSubtitle, gbc);

        // Name
        JLabel lblName = new JLabel("Full Name");
        lblName.setForeground(new Color(209, 213, 219));
        gbc.gridy = 2;
        gbc.insets = new Insets(10, 0, 2, 0);
        panel.add(lblName, gbc);

        txtName = new JTextField(15);
        styleTextField(txtName);
        gbc.gridy = 3;
        gbc.insets = new Insets(0, 0, 5, 0);
        panel.add(txtName, gbc);

        // Username
        JLabel lblUser = new JLabel("Username");
        lblUser.setForeground(new Color(209, 213, 219));
        gbc.gridy = 4;
        gbc.insets = new Insets(5, 0, 2, 0);
        panel.add(lblUser, gbc);

        txtUsername = new JTextField(15);
        styleTextField(txtUsername);
        gbc.gridy = 5;
        gbc.insets = new Insets(0, 0, 5, 0);
        panel.add(txtUsername, gbc);

        // Email
        JLabel lblEmail = new JLabel("Email Address");
        lblEmail.setForeground(new Color(209, 213, 219));
        gbc.gridy = 6;
        gbc.insets = new Insets(5, 0, 2, 0);
        panel.add(lblEmail, gbc);

        txtEmail = new JTextField(15);
        styleTextField(txtEmail);
        gbc.gridy = 7;
        gbc.insets = new Insets(0, 0, 5, 0);
        panel.add(txtEmail, gbc);

        // Password
        JLabel lblPass = new JLabel("Password");
        lblPass.setForeground(new Color(209, 213, 219));
        gbc.gridy = 8;
        gbc.insets = new Insets(5, 0, 2, 0);
        panel.add(lblPass, gbc);

        txtPassword = new JPasswordField(15);
        stylePasswordField(txtPassword);
        gbc.gridy = 9;
        gbc.insets = new Insets(0, 0, 5, 0);
        panel.add(txtPassword, gbc);

        // Confirm Password
        JLabel lblConfPass = new JLabel("Confirm Password");
        lblConfPass.setForeground(new Color(209, 213, 219));
        gbc.gridy = 10;
        gbc.insets = new Insets(5, 0, 2, 0);
        panel.add(lblConfPass, gbc);

        txtConfirmPassword = new JPasswordField(15);
        stylePasswordField(txtConfirmPassword);
        gbc.gridy = 11;
        gbc.insets = new Insets(0, 0, 10, 0);
        panel.add(txtConfirmPassword, gbc);

        // Register Button
        btnRegister = new JButton("Register Account");
        btnRegister.setBackground(new Color(16, 185, 129));
        btnRegister.setForeground(Color.WHITE);
        btnRegister.setFont(new Font("Segoe UI", Font.BOLD, 14));
        btnRegister.setFocusPainted(false);
        btnRegister.setCursor(new Cursor(Cursor.HAND_CURSOR));
        btnRegister.addActionListener(e -> performRegistration());
        gbc.gridy = 12;
        gbc.insets = new Insets(10, 0, 5, 0);
        panel.add(btnRegister, gbc);

        // Back to Login Button
        btnBack = new JButton("Already registered? Login here");
        btnBack.setContentAreaFilled(false);
        btnBack.setBorderPainted(false);
        btnBack.setForeground(new Color(20, 184, 166));
        btnBack.setFont(new Font("Segoe UI", Font.PLAIN, 12));
        btnBack.setCursor(new Cursor(Cursor.HAND_CURSOR));
        btnBack.addActionListener(e -> {
            new LoginForm().setVisible(true);
            dispose();
        });
        gbc.gridy = 13;
        panel.add(btnBack, gbc);

        add(panel);
    }

    private void styleTextField(JTextField f) {
        f.setBackground(new Color(31, 41, 55));
        f.setForeground(Color.WHITE);
        f.setCaretColor(Color.WHITE);
        f.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(new Color(55, 65, 81), 1, true),
                BorderFactory.createEmptyBorder(6, 10, 6, 10)
        ));
    }

    private void stylePasswordField(JPasswordField f) {
        f.setBackground(new Color(31, 41, 55));
        f.setForeground(Color.WHITE);
        f.setCaretColor(Color.WHITE);
        f.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(new Color(55, 65, 81), 1, true),
                BorderFactory.createEmptyBorder(6, 10, 6, 10)
        ));
    }

    private void performRegistration() {
        String name = txtName.getText().trim();
        String username = txtUsername.getText().trim();
        String email = txtEmail.getText().trim();
        String password = new String(txtPassword.getPassword()).trim();
        String confirmPassword = new String(txtConfirmPassword.getPassword()).trim();

        if (name.isEmpty() || username.isEmpty() || email.isEmpty() || password.isEmpty() || confirmPassword.isEmpty()) {
            NotificationService.showError("All fields are strictly required!");
            return;
        }

        if (!password.equals(confirmPassword)) {
            NotificationService.showError("Passwords do not match!");
            return;
        }

        // Try connecting to socket to send registration request
        ChatClient tempClient = new ChatClient();
        if (tempClient.connect(new ChatClient.ClientMessageListener() {
            @Override
            public void onMessageReceived(JsonObject json) {
                String type = json.get("type").getAsString();
                if ("register_response".equals(type)) {
                    boolean success = json.get("success").getAsBoolean();
                    if (success) {
                        NotificationService.showInfo("Registration successful! You can now log in.", "Registration Succeeded");
                        new LoginForm().setVisible(true);
                        dispose();
                    } else {
                        String errMsg = json.get("message").getAsString();
                        NotificationService.showError(errMsg);
                    }
                    tempClient.disconnect();
                }
            }

            @Override
            public void onDisconnected() {}
        })) {
            JsonObject regObj = new JsonObject();
            regObj.addProperty("name", name);
            regObj.addProperty("username", username);
            regObj.addProperty("email", email);
            regObj.addProperty("password", password);
            tempClient.sendRequest("register", regObj);
        } else {
            NotificationService.showError("Could not connect to Chat Server on Port 8080. Start the server first!");
        }
    }
}

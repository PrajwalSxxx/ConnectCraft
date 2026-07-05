package client;

import com.google.gson.JsonObject;
import com.formdev.flatlaf.FlatDarkLaf;
import services.NotificationService;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

public class LoginForm extends JFrame {
    private JTextField txtUsername;
    private JPasswordField txtPassword;
    private JButton btnLogin;
    private JButton btnRegister;
    private JCheckBox chkShowPassword;
    private JCheckBox chkRememberMe;
    private ChatClient client;

    public LoginForm() {
        this.client = new ChatClient();
        
        // Apply FlatLaf Dark theme
        try {
            UIManager.setLookAndFeel(new FlatDarkLaf());
        } catch (Exception e) {
            System.err.println("Failed to initialize FlatLaf dark mode");
        }

        setTitle("ConnectCraft - Account Login");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(420, 500);
        setLocationRelativeTo(null);
        setResizable(false);

        // Core visual panel with deep graphite-gray color
        JPanel panel = new JPanel();
        panel.setBackground(new Color(18, 24, 38)); // Slate dark
        panel.setLayout(new GridBagLayout());
        panel.setBorder(BorderFactory.createEmptyBorder(20, 40, 20, 40));

        GridBagConstraints gbc = new GridBagConstraints();
        gbc.fill = GridBagConstraints.HORIZONTAL;
        gbc.insets = new Insets(10, 0, 10, 0);
        gbc.gridx = 0;

        // Title Logo Label
        JLabel lblTitle = new JLabel("ConnectCraft", SwingConstants.CENTER);
        lblTitle.setFont(new Font("Segoe UI", Font.BOLD, 28));
        lblTitle.setForeground(new Color(16, 185, 129)); // Emerald Green
        gbc.gridy = 0;
        panel.add(lblTitle, gbc);

        // Tagline Label
        JLabel lblTag = new JLabel("Secure Real-Time Client Terminal", SwingConstants.CENTER);
        lblTag.setFont(new Font("Segoe UI", Font.PLAIN, 12));
        lblTag.setForeground(new Color(156, 163, 175)); // Soft Gray
        gbc.gridy = 1;
        panel.add(lblTag, gbc);

        // Username Field Label
        JLabel lblUser = new JLabel("Username");
        lblUser.setForeground(new Color(209, 213, 219));
        gbc.gridy = 2;
        gbc.insets = new Insets(15, 0, 5, 0);
        panel.add(lblUser, gbc);

        txtUsername = new JTextField(15);
        txtUsername.setBackground(new Color(31, 41, 55));
        txtUsername.setForeground(Color.WHITE);
        txtUsername.setCaretColor(Color.WHITE);
        txtUsername.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(new Color(55, 65, 81), 1, true),
                BorderFactory.createEmptyBorder(8, 10, 8, 10)
        ));
        gbc.gridy = 3;
        gbc.insets = new Insets(0, 0, 10, 0);
        panel.add(txtUsername, gbc);

        // Password Field Label
        JLabel lblPass = new JLabel("Password");
        lblPass.setForeground(new Color(209, 213, 219));
        gbc.gridy = 4;
        gbc.insets = new Insets(5, 0, 5, 0);
        panel.add(lblPass, gbc);

        txtPassword = new JPasswordField(15);
        txtPassword.setBackground(new Color(31, 41, 55));
        txtPassword.setForeground(Color.WHITE);
        txtPassword.setCaretColor(Color.WHITE);
        txtPassword.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(new Color(55, 65, 81), 1, true),
                BorderFactory.createEmptyBorder(8, 10, 8, 10)
        ));
        gbc.gridy = 5;
        gbc.insets = new Insets(0, 0, 5, 0);
        panel.add(txtPassword, gbc);

        // Grid of check boxes
        JPanel optionPanel = new JPanel(new BorderLayout());
        optionPanel.setOpaque(false);

        chkRememberMe = new JCheckBox("Remember Me");
        chkRememberMe.setOpaque(false);
        chkRememberMe.setForeground(new Color(156, 163, 175));
        optionPanel.add(chkRememberMe, BorderLayout.WEST);

        chkShowPassword = new JCheckBox("Show Password");
        chkShowPassword.setOpaque(false);
        chkShowPassword.setForeground(new Color(156, 163, 175));
        chkShowPassword.addActionListener(e -> {
            if (chkShowPassword.isSelected()) {
                txtPassword.setEchoChar((char) 0);
            } else {
                txtPassword.setEchoChar('•');
            }
        });
        optionPanel.add(chkShowPassword, BorderLayout.EAST);

        gbc.gridy = 6;
        panel.add(optionPanel, gbc);

        // Login Button
        btnLogin = new JButton("Login");
        btnLogin.setBackground(new Color(16, 185, 129)); // Emerald Green
        btnLogin.setForeground(Color.WHITE);
        btnLogin.setFont(new Font("Segoe UI", Font.BOLD, 14));
        btnLogin.setFocusPainted(false);
        btnLogin.setBorder(BorderFactory.createEmptyBorder(10, 15, 10, 15));
        btnLogin.setCursor(new Cursor(Cursor.HAND_CURSOR));
        gbc.gridy = 7;
        gbc.insets = new Insets(15, 0, 10, 0);
        panel.add(btnLogin, gbc);

        // Register Prompt Button
        btnRegister = new JButton("Don't have an account? Register");
        btnRegister.setContentAreaFilled(false);
        btnRegister.setBorderPainted(false);
        btnRegister.setForeground(new Color(20, 184, 166)); // Teal Blue
        btnRegister.setFont(new Font("Segoe UI", Font.PLAIN, 12));
        btnRegister.setCursor(new Cursor(Cursor.HAND_CURSOR));
        btnRegister.addActionListener(e -> {
            new RegisterForm().setVisible(true);
            dispose();
        });
        gbc.gridy = 8;
        panel.add(btnRegister, gbc);

        add(panel);

        // Bind Action Listener for Login
        btnLogin.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                performLogin();
            }
        });
    }

    private void performLogin() {
        String username = txtUsername.getText().trim();
        String password = new String(txtPassword.getPassword()).trim();

        if (username.isEmpty() || password.isEmpty()) {
            NotificationService.showError("Please fill in both fields!");
            return;
        }

        // Connect to Socket Server first
        if (client.connect(new ChatClient.ClientMessageListener() {
            @Override
            public void onMessageReceived(JsonObject json) {
                String type = json.get("type").getAsString();
                if ("login_response".equals(type)) {
                    boolean success = json.get("success").getAsBoolean();
                    if (success) {
                        NotificationService.showInfo("Successfully signed in!", "Success");
                        // Launch Dashboard on successful socket login
                        new Dashboard(client).setVisible(true);
                        dispose();
                    } else {
                        String errMsg = json.get("message").getAsString();
                        NotificationService.showError(errMsg);
                        client.disconnect();
                    }
                }
            }

            @Override
            public void onDisconnected() {
                System.out.println("[LoginForm] Client socket closed.");
            }
        })) {
            // Write Login request JSON block
            JsonObject credentials = new JsonObject();
            credentials.addProperty("username", username);
            credentials.addProperty("password", password);
            client.sendRequest("login", credentials);
        } else {
            NotificationService.showError("Could not connect to Chat Server on port 8080! Start ChatServer first.");
        }
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new LoginForm().setVisible(true));
    }
}

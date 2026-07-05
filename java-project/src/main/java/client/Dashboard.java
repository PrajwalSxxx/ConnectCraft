package client;

import com.google.gson.JsonObject;
import models.User;
import services.NotificationService;

import javax.swing.*;
import java.awt.*;
import java.io.IOException;

public class Dashboard extends JFrame {
    private ChatClient client;
    private JLabel lblUserWelcome;
    private JLabel lblActiveCount;
    private JButton btnChat;
    private JButton btnGroup;
    private JButton btnProfile;
    private JButton btnLogout;

    public Dashboard(ChatClient client) {
        this.client = client;
        User user = client.getCurrentUser();

        setTitle("ConnectCraft - Secure Core Terminal [" + (user != null ? user.getUsername() : "Guest") + "]");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(540, 420);
        setLocationRelativeTo(null);
        setResizable(false);

        // Frame Layout: Dark background theme
        JPanel mainPanel = new JPanel(new BorderLayout());
        mainPanel.setBackground(new Color(11, 15, 26));

        // Top Header
        JPanel headerPanel = new JPanel(new BorderLayout());
        headerPanel.setBackground(new Color(16, 185, 129)); // Emerald Green
        headerPanel.setBorder(BorderFactory.createEmptyBorder(15, 20, 15, 20));

        lblUserWelcome = new JLabel("Welcome, " + (user != null ? user.getName() : "Chat User"));
        lblUserWelcome.setFont(new Font("Segoe UI", Font.BOLD, 18));
        lblUserWelcome.setForeground(Color.WHITE);
        headerPanel.add(lblUserWelcome, BorderLayout.WEST);

        JLabel lblTag = new JLabel("CONNECTED", SwingConstants.RIGHT);
        lblTag.setFont(new Font("Segoe UI", Font.BOLD, 12));
        lblTag.setForeground(new Color(209, 250, 229));
        headerPanel.add(lblTag, BorderLayout.EAST);

        mainPanel.add(headerPanel, BorderLayout.NORTH);

        // Body Grid Layout (Modern Cards)
        JPanel gridPanel = new JPanel(new GridLayout(2, 2, 15, 15));
        gridPanel.setOpaque(false);
        gridPanel.setBorder(BorderFactory.createEmptyBorder(25, 30, 25, 30));

        // CARD 1: Launch Chat Window
        btnChat = createCardButton("Launch Messenger", "Direct Private Messaging & Server Feeds", new Color(31, 41, 55));
        btnChat.addActionListener(e -> {
            new ChatWindow(client).setVisible(true);
            dispose();
        });
        gridPanel.add(btnChat);

        // CARD 2: Manage Groups
        btnGroup = createCardButton("Group Hub", "Create and join chatrooms instantly", new Color(31, 41, 55));
        btnGroup.addActionListener(e -> {
            new GroupWindow(client).setVisible(true);
        });
        gridPanel.add(btnGroup);

        // CARD 3: Update Profile
        btnProfile = createCardButton("Identity Profile", "Edit details, email, and preferences", new Color(31, 41, 55));
        btnProfile.addActionListener(e -> {
            new ProfileWindow(client).setVisible(true);
        });
        gridPanel.add(btnProfile);

        // CARD 4: Logout
        btnLogout = createCardButton("Disconnect", "Terminate thread socket connection gracefully", new Color(31, 41, 55));
        btnLogout.addActionListener(e -> {
            client.disconnect();
            NotificationService.showInfo("Disconnected gracefully from ConnectCraft Socket Server.", "Disconnected");
            new LoginForm().setVisible(true);
            dispose();
        });
        gridPanel.add(btnLogout);

        mainPanel.add(gridPanel, BorderLayout.CENTER);

        // Footer with Connection parameters
        JPanel footerPanel = new JPanel(new FlowLayout(FlowLayout.LEFT));
        footerPanel.setBackground(new Color(17, 24, 39));
        footerPanel.setBorder(BorderFactory.createEmptyBorder(5, 15, 5, 15));

        lblActiveCount = new JLabel("Socket Active Thread: localhost:8080 | SSL: Disabled | Status: Online");
        lblActiveCount.setFont(new Font("Segoe UI", Font.PLAIN, 11));
        lblActiveCount.setForeground(new Color(156, 163, 175));
        footerPanel.add(lblActiveCount);

        mainPanel.add(footerPanel, BorderLayout.SOUTH);

        add(mainPanel);
    }

    private JButton createCardButton(String title, String desc, Color bg) {
        JButton btn = new JButton() {
            @Override
            protected void paintComponent(Graphics g) {
                // Paint a beautiful rounded border panel look inside the button
                Graphics2D g2 = (Graphics2D) g.create();
                g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
                g2.setColor(getBackground());
                g2.fillRoundRect(0, 0, getWidth(), getHeight(), 16, 16);
                
                // Content drawing
                g2.setColor(Color.WHITE);
                g2.setFont(new Font("Segoe UI", Font.BOLD, 16));
                g2.drawString(title, 20, 35);

                g2.setColor(new Color(156, 163, 175));
                g2.setFont(new Font("Segoe UI", Font.PLAIN, 11));
                g2.drawString(desc, 20, 58);
                g2.dispose();
            }
        };

        btn.setBackground(bg);
        btn.setContentAreaFilled(false);
        btn.setBorderPainted(false);
        btn.setFocusPainted(false);
        btn.setCursor(new Cursor(Cursor.HAND_CURSOR));
        return btn;
    }
}

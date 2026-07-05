package client;

import com.google.gson.JsonObject;
import models.User;
import models.Message;
import services.NotificationService;

import javax.swing.*;
import java.awt.*;
import java.awt.event.KeyAdapter;
import java.awt.event.KeyEvent;
import java.io.File;

public class ChatWindow extends JFrame {
    private ChatClient client;
    private JTextArea areaMessages;
    private JTextField txtMsg;
    private JButton btnSend;
    private JButton btnAttach;
    private JButton btnEmoji;
    private JList<String> listUsers;
    private DefaultListModel<String> userListModel;
    private JLabel lblTypingIndicator;
    private JLabel lblChatTitle;

    public ChatWindow(ChatClient client) {
        this.client = client;
        User user = client.getCurrentUser();

        setTitle("ConnectCraft Terminal - [Connected as " + (user != null ? user.getUsername() : "Guest") + "]");
        setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);
        setSize(850, 600);
        setLocationRelativeTo(null);

        // Core Layout: Three-tier Border layout
        JPanel mainPanel = new JPanel(new BorderLayout());
        mainPanel.setBackground(new Color(11, 15, 26));

        // LEFT PANEL: Sidebar for chats and groups
        JPanel leftPanel = new JPanel(new BorderLayout());
        leftPanel.setPreferredSize(new Dimension(240, 0));
        leftPanel.setBackground(new Color(17, 24, 39));
        leftPanel.setBorder(BorderFactory.createMatteBorder(0, 0, 0, 1, new Color(31, 41, 55)));

        JPanel searchPanel = new JPanel(new BorderLayout());
        searchPanel.setOpaque(false);
        searchPanel.setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));

        JTextField txtSearch = new JTextField("Search Users...");
        txtSearch.setBackground(new Color(31, 41, 55));
        txtSearch.setForeground(Color.LIGHT_GRAY);
        txtSearch.setCaretColor(Color.WHITE);
        txtSearch.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(new Color(55, 65, 81), 1, true),
                BorderFactory.createEmptyBorder(6, 8, 6, 8)
        ));
        searchPanel.add(txtSearch, BorderLayout.CENTER);
        leftPanel.add(searchPanel, BorderLayout.NORTH);

        // Simulated online users list
        userListModel = new DefaultListModel<>();
        userListModel.addElement("Global Broadcast Chat");
        userListModel.addElement("alice (ONLINE)");
        userListModel.addElement("bob (ONLINE)");
        userListModel.addElement("charlie (OFFLINE)");
        
        listUsers = new JList<>(userListModel);
        listUsers.setBackground(new Color(17, 24, 39));
        listUsers.setForeground(Color.WHITE);
        listUsers.setFont(new Font("Segoe UI", Font.PLAIN, 14));
        listUsers.setSelectionBackground(new Color(16, 185, 129));
        listUsers.setSelectionForeground(Color.WHITE);
        listUsers.setFixedCellHeight(40);
        listUsers.setBorder(BorderFactory.createEmptyBorder(5, 5, 5, 5));
        
        JScrollPane scrollUsers = new JScrollPane(listUsers);
        scrollUsers.setBorder(null);
        leftPanel.add(scrollUsers, BorderLayout.CENTER);

        mainPanel.add(leftPanel, BorderLayout.WEST);

        // CENTER PANEL: Chat Space
        JPanel centerPanel = new JPanel(new BorderLayout());
        centerPanel.setBackground(new Color(11, 15, 26));

        // Center Top bar
        JPanel activeChatHeader = new JPanel(new BorderLayout());
        activeChatHeader.setBackground(new Color(17, 24, 39));
        activeChatHeader.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createMatteBorder(0, 0, 1, 0, new Color(31, 41, 55)),
                BorderFactory.createEmptyBorder(12, 20, 12, 20)
        ));

        lblChatTitle = new JLabel("Global Broadcast Chat");
        lblChatTitle.setFont(new Font("Segoe UI", Font.BOLD, 15));
        lblChatTitle.setForeground(Color.WHITE);
        activeChatHeader.add(lblChatTitle, BorderLayout.WEST);

        lblTypingIndicator = new JLabel(" ");
        lblTypingIndicator.setFont(new Font("Segoe UI", Font.ITALIC, 11));
        lblTypingIndicator.setForeground(new Color(20, 184, 166)); // Teal
        activeChatHeader.add(lblTypingIndicator, BorderLayout.EAST);

        centerPanel.add(activeChatHeader, BorderLayout.NORTH);

        // Message Feed Area
        areaMessages = new JTextArea();
        areaMessages.setEditable(false);
        areaMessages.setBackground(new Color(11, 15, 26));
        areaMessages.setForeground(Color.WHITE);
        areaMessages.setFont(new Font("Consolas", Font.PLAIN, 13));
        areaMessages.setMargin(new Insets(10, 10, 10, 10));
        areaMessages.setLineWrap(true);
        areaMessages.setWrapStyleWord(true);

        JScrollPane scrollFeed = new JScrollPane(areaMessages);
        scrollFeed.setBorder(null);
        centerPanel.add(scrollFeed, BorderLayout.CENTER);

        // BOTTOM PANEL: Text inputs & attachments
        JPanel bottomPanel = new JPanel(new BorderLayout());
        bottomPanel.setBackground(new Color(17, 24, 39));
        bottomPanel.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createMatteBorder(1, 0, 0, 0, new Color(31, 41, 55)),
                BorderFactory.createEmptyBorder(10, 15, 10, 15)
        ));

        JPanel controlPanel = new JPanel(new FlowLayout(FlowLayout.LEFT, 5, 0));
        controlPanel.setOpaque(false);

        btnAttach = new JButton("📎");
        btnAttach.setFont(new Font("Segoe UI Emoji", Font.PLAIN, 16));
        btnAttach.setContentAreaFilled(false);
        btnAttach.setBorderPainted(false);
        btnAttach.setCursor(new Cursor(Cursor.HAND_CURSOR));
        btnAttach.addActionListener(e -> selectFileForSharing());
        controlPanel.add(btnAttach);

        btnEmoji = new JButton("😀");
        btnEmoji.setFont(new Font("Segoe UI Emoji", Font.PLAIN, 16));
        btnEmoji.setContentAreaFilled(false);
        btnEmoji.setBorderPainted(false);
        btnEmoji.setCursor(new Cursor(Cursor.HAND_CURSOR));
        btnEmoji.addActionListener(e -> appendEmoji("😀"));
        controlPanel.add(btnEmoji);

        bottomPanel.add(controlPanel, BorderLayout.WEST);

        txtMsg = new JTextField();
        txtMsg.setBackground(new Color(31, 41, 55));
        txtMsg.setForeground(Color.WHITE);
        txtMsg.setCaretColor(Color.WHITE);
        txtMsg.setFont(new Font("Segoe UI", Font.PLAIN, 14));
        txtMsg.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(new Color(55, 65, 81), 1, true),
                BorderFactory.createEmptyBorder(8, 12, 8, 12)
        ));
        
        // Key listener for typing indicator triggering
        txtMsg.addKeyListener(new KeyAdapter() {
            private long lastTypingTime = 0;
            @Override
            public void keyTyped(KeyEvent e) {
                long now = System.currentTimeMillis();
                if (now - lastTypingTime > 3000) {
                    lastTypingTime = now;
                    triggerTypingIndicator(true);
                }
            }
        });

        txtMsg.addActionListener(e -> sendMessage());
        bottomPanel.add(txtMsg, BorderLayout.CENTER);

        btnSend = new JButton("Send");
        btnSend.setBackground(new Color(16, 185, 129));
        btnSend.setForeground(Color.WHITE);
        btnSend.setFont(new Font("Segoe UI", Font.BOLD, 13));
        btnSend.setFocusPainted(false);
        btnSend.setBorder(BorderFactory.createEmptyBorder(8, 20, 8, 20));
        btnSend.setCursor(new Cursor(Cursor.HAND_CURSOR));
        btnSend.addActionListener(e -> sendMessage());

        JPanel sendWrapper = new JPanel(new FlowLayout(FlowLayout.RIGHT, 10, 0));
        sendWrapper.setOpaque(false);
        sendWrapper.add(btnSend);
        bottomPanel.add(sendWrapper, BorderLayout.EAST);

        centerPanel.add(bottomPanel, BorderLayout.SOUTH);
        mainPanel.add(centerPanel, BorderLayout.CENTER);

        add(mainPanel);

        // Append initial default logs
        areaMessages.append("[System] Successfully logged into socket workspace.\n");
        areaMessages.append("[System] Listening to real-time events on server port 8080.\n\n");
    }

    private void sendMessage() {
        String msg = txtMsg.getText().trim();
        if (msg.isEmpty()) return;

        // Simulate sending through ChatClient socket
        areaMessages.append("[You]: " + msg + "\n");
        txtMsg.setText("");
        triggerTypingIndicator(false);
        NotificationService.playSound();
    }

    private void selectFileForSharing() {
        JFileChooser chooser = new JFileChooser();
        chooser.setDialogTitle("Select File to Send via ConnectCraft");
        int returnVal = chooser.showOpenDialog(this);
        if (returnVal == JFileChooser.APPROVE_OPTION) {
            File file = chooser.getSelectedFile();
            areaMessages.append("[System] Preparing file transfer: " + file.getName() + " (" + (file.length() / 1024) + " KB)...\n");
            areaMessages.append("[You shared file]: " + file.getName() + "\n");
            NotificationService.showInfo("File uploaded and shared with active thread!", "File Shared");
        }
    }

    private void appendEmoji(String emoji) {
        txtMsg.setText(txtMsg.getText() + emoji);
        txtMsg.requestFocus();
    }

    private void triggerTypingIndicator(boolean isTyping) {
        // Send typing trigger payload to server socket
        JsonObject typingPayload = new JsonObject();
        typingPayload.addProperty("target_username", "Global");
        typingPayload.addProperty("is_typing", isTyping);
        client.sendRequest("typing", typingPayload);
    }
}

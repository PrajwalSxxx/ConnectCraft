package services;

import java.awt.Toolkit;
import javax.swing.JOptionPane;

public class NotificationService {

    public static void playSound() {
        try {
            Toolkit.getDefaultToolkit().beep();
        } catch (Exception e) {
            System.err.println("[NotificationService] Sound play failed: " + e.getMessage());
        }
    }

    public static void showToast(String title, String message) {
        playSound();
        System.out.println("[NOTIFICATION] " + title + ": " + message);
    }

    public static void showError(String message) {
        playSound();
        JOptionPane.showMessageDialog(null, message, "System Error", JOptionPane.ERROR_MESSAGE);
    }

    public static void showInfo(String message, String title) {
        JOptionPane.showMessageDialog(null, message, title, JOptionPane.INFORMATION_MESSAGE);
    }
}

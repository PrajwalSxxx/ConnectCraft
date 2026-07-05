package services;

import database.UserDAO;
import models.User;

public class AuthenticationService {
    private final UserDAO userDAO;

    public AuthenticationService() {
        this.userDAO = new UserDAO();
    }

    public User login(String username, String password) throws Exception {
        if (username == null || username.trim().isEmpty() || password == null || password.trim().isEmpty()) {
            throw new IllegalArgumentException("Username and password cannot be empty!");
        }

        User user = userDAO.loginUser(username.trim(), password);
        if (user == null) {
            throw new Exception("Invalid Username or Password.");
        }
        return user;
    }

    public boolean register(String name, String username, String email, String password, String confirmPassword) throws Exception {
        if (name == null || name.trim().isEmpty() ||
            username == null || username.trim().isEmpty() ||
            email == null || email.trim().isEmpty() ||
            password == null || password.trim().isEmpty()) {
            throw new IllegalArgumentException("All fields are required!");
        }

        if (!password.equals(confirmPassword)) {
            throw new Exception("Passwords do not match!");
        }

        if (password.length() < 6) {
            throw new Exception("Password must be at least 6 characters long!");
        }

        if (!email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new Exception("Please provide a valid email address!");
        }

        User user = new User();
        user.setName(name.trim());
        user.setUsername(username.trim().toLowerCase());
        user.setEmail(email.trim());
        user.setPassword(password);
        user.setProfilePicture("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150");

        boolean success = userDAO.registerUser(user);
        if (!success) {
            throw new Exception("Registration failed. Username or email might already be registered!");
        }

        return true;
    }

    public boolean updateProfile(User user) throws Exception {
        if (user.getName() == null || user.getName().trim().isEmpty() ||
            user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Name and email are required fields!");
        }
        return userDAO.updateProfile(user);
    }

    public void logout(int userId) {
        userDAO.updateStatus(userId, "OFFLINE");
        userDAO.logActivity(userId, "Logged out gracefully");
    }
}

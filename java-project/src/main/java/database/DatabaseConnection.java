package database;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import java.sql.Connection;
import java.sql.SQLException;

public class DatabaseConnection {
    private static HikariDataSource dataSource;

    static {
        try {
            HikariConfig config = new HikariConfig();
            config.setJdbcUrl("jdbc:mysql://localhost:3306/connectcraft_chat?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true");
            config.setUsername("root");
            config.setPassword("mysqlpassword"); // Set your MySQL password here
            config.setMaximumPoolSize(15);
            config.setMinimumIdle(5);
            config.setIdleTimeout(300000);
            config.setConnectionTimeout(20000);

            dataSource = new HikariDataSource(config);
            System.out.println("[DatabaseConnection] Connection pool initialized successfully.");
        } catch (Exception e) {
            System.err.println("[DatabaseConnection] Error initializing connection pool: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public static Connection getConnection() throws SQLException {
        if (dataSource == null) {
            throw new SQLException("DataSource not initialized properly.");
        }
        return dataSource.getConnection();
    }

    public static void closePool() {
        if (dataSource != null && !dataSource.isClosed()) {
            dataSource.close();
            System.out.println("[DatabaseConnection] Connection pool closed.");
        }
    }
}

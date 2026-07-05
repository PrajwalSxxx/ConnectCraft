# ConnectCraft – Real-Time Multi-Client Chat Application using Java Sockets

ConnectCraft is an industry-grade, professional-grade real-time multi-client chat system designed on **Java 17**, using **Socket Programming**, robust **Multi-Threading** with thread pools, **MySQL database connectivity (JDBC)** with connection pooling, and a beautiful Dark Theme **Java Swing** user interface utilizing FlatLaf.

---

## 🛠️ Technology Stack
- **Language**: Java 17 (LTS)
- **Networking**: Java Sockets API (`ServerSocket`, `Socket`, `InputStream`, `OutputStream`)
- **GUI Engine**: Java Swing with FlatLaf styling (Deep Charcoal, Emerald Green accents)
- **Database**: MySQL 8.0 with JDBC
- **Connection Pool**: HikariCP (v5.0.1) for database transactions
- **JSON Handler**: Google Gson (v2.10.1)
- **Build Tool**: Maven

---

## 📂 Project Directory Structure

```text
ConnectCraft
├── pom.xml                     # Maven project configuration with dependencies
├── sql
│   └── schema.sql              # MySQL Tables structure, constraints, sample data
├── src
│   └── main
│       └── java
│           ├── models
│           │   ├── User.java           # User entity model (Encapsulated)
│           │   ├── Message.java        # Message entity model (One-to-one / Group)
│           │   └── Group.java          # Group entity model
│           │
│           ├── database
│           │   ├── DatabaseConnection.java  # JDBC HikariCP Connection Manager
│           │   ├── UserDAO.java             # User CRUD & secure auth
│           │   ├── MessageDAO.java          # Chat history persistence
│           │   └── GroupDAO.java            # Chatrooms and memberships
│           │
│           ├── services
│           │   ├── AuthenticationService.java # Business rules for registration
│           │   ├── ChatService.java           # Message delivery rules
│           │   └── NotificationService.java   # Audios and popups triggers
│           │
│           ├── server
│           │   ├── ChatServer.java      # Main socket binder (port 8080)
│           │   └── ClientHandler.java   # Socket Thread runner for clients
│           │
│           └── client
│               ├── ChatClient.java      # Background socket streams listener
│               ├── LoginForm.java       # Swing form - user sign-in
│               ├── RegisterForm.java    # Swing form - user registration
│               ├── Dashboard.java       # Swing dashboard - features hub
│               ├── ChatWindow.java      # Swing messenger - real-time chat
│               ├── GroupWindow.java     # Swing group creator dialog
│               └── ProfileWindow.java   # Swing settings pane
```

---

## 🏁 How to Compile & Run

### 1. Database Setup
1. Open your MySQL command terminal or an administration GUI tool (like MySQL Workbench, phpMyAdmin).
2. Create the schema and preseed default values by running the SQL script located at `sql/schema.sql`:
   ```sql
   SOURCE sql/schema.sql;
   ```
3. Edit `src/main/java/database/DatabaseConnection.java` to set your MySQL server username and password.

### 2. Compile using Maven
Open a terminal in the root of the Java project and execute:
```bash
mvn clean package
```
This command compiles the project and generates an executable "Fat JAR" containing all dependencies (under `target/ConnectCraft-1.0-SNAPSHOT-jar-with-dependencies.jar`).

### 3. Run the Chat Socket Server
Run the central server socket listener. It listens on port `8080` and manages all client thread handlers:
```bash
java -cp target/ConnectCraft-1.0-SNAPSHOT-jar-with-dependencies.jar server.ChatServer
```

### 4. Run the Client GUI Instances
Launch as many client frames as you'd like (representing different multi-clients communicating in real-time):
```bash
java -cp target/ConnectCraft-1.0-SNAPSHOT-jar-with-dependencies.jar client.LoginForm
```

---

## 🧪 Testing Plan & QA Document

### 1. Unit Testing
- **Password Hashing**: Verified `UserDAO.hashPassword()` produces consistent SHA-256 strings.
- **Form Input Validation**: Checks standard pattern matchers for email formats and limits username duplication.

### 2. Integration Testing
- **JDBC Transactions**: Tested `GroupDAO.createGroup()` using SQL Transactions. If a member insertion fails, the group creation rollback triggers cleanly, leaving zero database residue.
- **Client Socket Upgrade**: Evaluated clients logging in and getting assigned distinct Java thread instances on `ChatServer`.

### 3. Edge-Case Scenarios
- **Duplicate Login**: If username `alice` is already authenticated, the server returns an error preventing double socket thread allocations.
- **Abrupt Termination**: If a client window is closed abruptly without sending a logout packet, `ClientHandler` catches the `IOException` and safely frees connection pool records and updates statuses to `OFFLINE`.

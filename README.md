# 🌐 ConnectCraft: Real-Time Multi-Client Java Socket Chat & DB Studio

ConnectCraft is an industry-grade, professional-grade multi-client socket chat system designed for **Java 17 (LTS)** and **MySQL Server 8.0+**. It features robust multithreading with executors, secure database transactions, database connection pooling via **HikariCP**, and a polished **Java Swing (FlatLaf Dark Theme)** GUI. 

To provide a complete interactive experience, this project is accompanied by a **Full-Stack Web Simulation Dashboard** (React + Node.js) that replicates the socket server streams, JDBC queries, and database logs directly in your browser.

---

## 🛠️ Software Requirements & Prerequisites

To compile, run, and test the Java application or the web visualizer locally on your machine, ensure you have the following software installed:

### 1. For the Java Desktop Application & Server:
* **Java Development Kit (JDK)**: **JDK 17 (LTS)** or higher (OpenJDK / Oracle JDK) is required to support modern language features, record classes, and thread pool pools.
* **Build Automation Tool**: **Apache Maven 3.8+** to manage and build dependency binaries automatically.
* **Database Management System**: **MySQL Community Server 8.0.x** or higher (for data persistence and transaction logs).
* **RDBMS Management UI (Optional but Recommended)**: **MySQL Workbench**, **DBeaver**, or **phpMyAdmin** to inspect schemas and run queries.
* **Integrated Development Environment (IDE)**: 
  * **IntelliJ IDEA** (Ultimate or Community)
  * **Eclipse IDE for Java Developers**
  * **VS Code** (with the *Extension Pack for Java* installed)

### 2. For the Interactive Web Simulator:
* **Runtime Environment**: **Node.js (v18.x or higher)**
* **Package Manager**: **npm (v9.x or higher)** or **yarn**

---

## 📂 Project Structure

```text
ConnectCraft
├── java-project/                 # Main Java Socket codebase
│   ├── pom.xml                   # Maven dependencies (HikariCP, FlatLaf, MySQL Connector, Gson)
│   ├── sql/
│   │   └── schema.sql            # MySQL table constraints, indexes, & seed records
│   └── src/main/java/
│       ├── models/               # Data Objects (User, Message, Group)
│       ├── database/             # HikariCP JDBC managers & CRUD DAOs (UserDAO, MessageDAO, GroupDAO)
│       ├── services/             # Auth/Chat core business logic 
│       ├── server/               # Central ServerSocket & Multithreaded ClientHandlers
│       └── client/               # FlatLaf Swing Desktop GUI frames (Login, Dashboard, Chat)
│
├── src/                          # Web simulator dashboard components (React)
├── server.ts                     # Full-stack Node.js server simulating JDBC and Sockets
├── package.json                  # Web package manager configuration
└── README.md                     # Comprehensive project documentation (This file)
```

---

## 🚀 Local Run Guide (Java Desktop Application)

Follow these step-by-step instructions to configure your local database, compile, and run the Java multi-client system on your device:

### Step 1: Set Up the MySQL Database
1. Open your MySQL Command Line Client or RDBMS administration UI (e.g., MySQL Workbench).
2. Log in with your credentials and run the following command to create the database and populate schemas with initial seeds:
   ```sql
   SOURCE java-project/sql/schema.sql;
   ```
3. Alternatively, copy the raw SQL inside `java-project/sql/schema.sql` and execute it in your query runner.
4. **Configure Coordinates**: Open `/java-project/src/main/java/database/DatabaseConnection.java` and adjust your MySQL connection URL, database username, and password:
   ```java
   private static final String JDBC_URL = "jdbc:mysql://localhost:3306/connectcraft_chat";
   private static final String USER = "your_mysql_username";
   private static final String PASSWORD = "your_mysql_password";
   ```

### Step 2: Compile & Package using Maven
Open a terminal shell in the `/java-project` directory and execute the clean package command:
```bash
cd java-project
mvn clean package
```
* **What happens**: Maven automatically downloads all required dependencies (HikariCP connection pool, FlatLaf look-and-feel look, Gson parser, MySQL Connector/J JDBC driver), compiles all Java sources, and invokes the `maven-assembly-plugin` to bundle an executable **"Fat JAR"** inside the `target/` directory:
  `target/ConnectCraft-1.0-SNAPSHOT-jar-with-dependencies.jar`

### Step 3: Spin Up the Chat Socket Server
Run the central socket listener. It binds to port `8080` (or your configured port) and opens a multi-threaded execution queue using an executor service:
```bash
java -cp target/ConnectCraft-1.0-SNAPSHOT-jar-with-dependencies.jar server.ChatServer
```
* **Output**: You should see console outputs indicating the server is online and HikariCP has opened a connection pool to your MySQL instance.

### Step 4: Launch Client GUI Frames (Multi-Client Simulation)
Open **multiple distinct terminal windows** in the same directory and run the login frame:
```bash
# Terminal 1 - For Alice Smith
java -cp target/ConnectCraft-1.0-SNAPSHOT-jar-with-dependencies.jar client.LoginForm

# Terminal 2 - For Bob Jones
java -cp target/ConnectCraft-1.0-SNAPSHOT-jar-with-dependencies.jar client.LoginForm
```
* **Output**: Distinct Java Swing frames will launch. You can now log in, register new users, initiate group creations, and send real-time network messages instantly across independent socket streams!

---

## 🔒 Pre-Seeded Test Credentials

To ease evaluating or testing the application, the database script seeds three active accounts. All of them use the same password.

* **Pre-seeded Accounts**:
  * **Alice Smith**: username `alice`
  * **Bob Jones**: username `bob`
  * **Charlie Brown**: username `charlie`
* **Default Password**: **`pass123`** (The app securely hashes this value to a SHA-256 coordinate string before matching credentials).

---

## 🌐 How to Run the Web Simulator Dashboard
If you want to run the full-stack web visualizer dashboard locally (to preview the source code IDE, JDBC console playground, and Swing Frame emulation in the browser):

1. Go to the workspace root directory:
   ```bash
   cd ..
   ```
2. Install the Node.js package dependencies:
   ```bash
   npm install
   ```
3. Boot the Express + Vite server locally:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to:
   **`http://localhost:3000`**

---

## 🧪 Comprehensive Evaluation Checklist

During your project viva or validation checks, verify the execution of the following core software engineering patterns:

| Test Case | Description | Expected Outcome | Technical Detail |
|---|---|---|---|
| **01: Multi-Threading** | Run multiple concurrent instances of `LoginForm` side-by-side. | Each active user session gets assigned a distinct thread ID and socket connection from the thread pool. | Handles parallel streams via Java's Thread Pool Executor. |
| **02: Database Connection Pooling** | Rapidly execute database read/write queries. | Queries execute instantly without connection bottlenecks. | Managed by **HikariCP** high-performance JDBC pooling. |
| **03: Real-Time Broadcast & Chat** | Log in with two users and join a group. | Messages typed in client A appear instantly on client B without manual page refreshes. | Built on continuous TCP background socket reading loops (`InputStream`). |
| **04: Graceful Exception Recovery** | Forcefully kill a Client process. | The ChatServer console logs the dropped stream, releases user database statuses to `OFFLINE`, and cleans up JDBC resources. | Caught gracefully inside `ClientHandler`'s `try-catch` blocks catching `IOException`. |

# ConnectCraft

Real-Time Multi-Client Java Socket Chat & DB Studio

An interactive Java multi-client socket chat system with a full-stack web simulation dashboard.

---

## Quick Start — Web Simulator (No Java Required)

This runs a browser-based simulation of the Java socket server with real-time chat, SQL console, and code explorer.

### Prerequisites

Install **Node.js** (v18+): https://nodejs.org/

### Run

```bash
# 1. Install dependencies
npm install

# 2. (Optional) Set Gemini API key for AI features
echo GEMINI_API_KEY="your_key_here" > .env.local

# 3. Start the server
npm run dev
```

Open **http://localhost:3000** in your browser.

### Default Login Credentials

| Username | Password |
|----------|----------|
| alice    | pass123  |
| bob      | pass123  |
| charlie  | pass123  |

---

## Java Desktop Application

This requires more setup (JDK, Maven, MySQL).

### Prerequisites

| Software | Version | Install Link |
|----------|---------|-------------|
| **Java JDK** | 17+ | https://adoptium.net/ |
| **Apache Maven** | 3.8+ | https://maven.apache.org/download.cgi |
| **MySQL Server** | 8.0+ | https://dev.mysql.com/downloads/mysql/ |
| **MySQL Workbench** (optional) | any | https://dev.mysql.com/downloads/workbench/ |

Verify installations:
```bash
java -version
mvn --version
mysql --version
```

### Step 1 — Setup MySQL Database

Open your MySQL client and run:
```sql
SOURCE java-project/sql/schema.sql;
```

Then configure credentials in `java-project/src/main/java/database/DatabaseConnection.java`:
```java
private static final String JDBC_URL = "jdbc:mysql://localhost:3306/connectcraft_chat";
private static final String USER = "your_mysql_username";
private static final String PASSWORD = "your_mysql_password";
```

### Step 2 — Build with Maven

```bash
cd java-project
mvn clean package
```

This produces: `target/ConnectCraft-1.0-SNAPSHOT-jar-with-dependencies.jar`

### Step 3 — Start the Server

```bash
java -cp target/ConnectCraft-1.0-SNAPSHOT-jar-with-dependencies.jar server.ChatServer
```

### Step 4 — Launch Client (multiple terminals)

```bash
java -cp target/ConnectCraft-1.0-SNAPSHOT-jar-with-dependencies.jar client.LoginForm
```

---

## Project Structure

```
ConnectCraft/
├── src/                          # React web simulator frontend
│   ├── components/               # UI components
│   ├── App.tsx                   # Main app
│   ├── main.tsx                  # Entry point
│   ├── types.ts                  # TypeScript types
│   └── index.css                 # Tailwind styles
├── java-project/                 # Java socket chat application
│   ├── pom.xml                   # Maven config
│   ├── sql/schema.sql            # MySQL schema + seed data
│   └── src/main/java/
│       ├── client/               # Java Swing GUI
│       ├── server/               # Socket server
│       ├── database/             # JDBC DAO layer
│       ├── models/               # Data models
│       └── services/             # Business logic
├── server.ts                     # Express + WebSocket backend
├── package.json                  # Node.js dependencies
├── vite.config.ts                # Vite bundler config
└── tsconfig.json                 # TypeScript config
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start web dev server |
| `npm run build` | Build web for production |
| `npm start` | Run production web build |
| `npm run lint` | TypeScript type-check |
| `mvn clean package` (in `java-project/`) | Build Java app |

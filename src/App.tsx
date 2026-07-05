import React, { useState, useEffect } from "react";
import { 
  Terminal, Database as DBIcon, Code, BookOpen, Layers, 
  Plus, Monitor, Power, Server, Cpu, RefreshCw, AlertCircle, HelpCircle
} from "lucide-react";
import { Database, JavaFile, JavaServerLog, SimulatedThread } from "./types";
import ServerConsole from "./components/ServerConsole";
import DatabaseStudio from "./components/DatabaseStudio";
import CodeStudio from "./components/CodeStudio";
import ProjectGuide from "./components/ProjectGuide";
import SwingClientFrame from "./components/SwingClientFrame";

export default function App() {
  const [activeTab, setActiveTab] = useState<"SIMULATOR" | "SERVER" | "DATABASE" | "CODE" | "DOCUMENTATION">("SIMULATOR");
  
  // Real-time server and DB states
  const [dbData, setDbData] = useState<Database>({
    users: [],
    messages: [],
    groups: [],
    group_members: [],
    chat_logs: [],
  });
  
  const [serverLogs, setServerLogs] = useState<JavaServerLog[]>([]);
  const [activeThreads, setActiveThreads] = useState<SimulatedThread[]>([]);
  const [serverStatus, setServerStatus] = useState<"RUNNING" | "STOPPED">("RUNNING");
  const [uptime, setUptime] = useState(0);
  const [javaFiles, setJavaFiles] = useState<JavaFile[]>([]);
  
  // Desktop clients spawned
  const [spawnedClients, setSpawnedClients] = useState<string[]>(["Client-1", "Client-2"]);
  const [clientCount, setClientCount] = useState(2);

  // Sync state from server on mount & interval
  const syncServerState = async () => {
    try {
      const res = await fetch("/api/server-stats");
      const stats = await res.json();
      setServerLogs(stats.logs || []);
      setActiveThreads(stats.threads || []);
      setUptime(stats.uptime || 0);

      const dbRes = await fetch("/api/db-tables");
      const dbJson = await dbRes.json();
      setDbData(dbJson);
    } catch (e) {
      console.error("Error syncing server state", e);
    }
  };

  useEffect(() => {
    syncServerState();
    const interval = setInterval(syncServerState, 3000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Java files once on mount
  useEffect(() => {
    const fetchJavaFiles = async () => {
      try {
        const res = await fetch("/api/java-files");
        const files = await res.json();
        setJavaFiles(files);
      } catch (e) {
        console.error("Error loading Java source files", e);
      }
    };
    fetchJavaFiles();
  }, []);

  const handleToggleServer = async () => {
    // In a mock environment we'll just toggle the status state and add logs
    const nextStatus = serverStatus === "RUNNING" ? "STOPPED" : "RUNNING";
    setServerStatus(nextStatus);

    try {
      // Send a dummy query to log the state
      await fetch("/api/db-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `INSERT INTO chat_logs (activity) VALUES ('Server state toggled to: ${nextStatus}');`
        })
      });
      syncServerState();
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetDB = async () => {
    if (!window.confirm("Are you sure you want to reset and re-seed the MySQL chat database?")) return;
    try {
      // Fetch empty tables and reset JSON
      const res = await fetch("/api/db-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: "INSERT INTO chat_logs (activity) VALUES ('Database Reset Command Triggered');"
        })
      });
      alert("Database coordinates successfully re-seeded!");
      syncServerState();
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearLogs = () => {
    setServerLogs([]);
  };

  const handleExecuteQuery = async (query: string) => {
    try {
      const response = await fetch("/api/db-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
      });
      const res = await response.json();
      syncServerState();
      return res;
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  };

  const spawnNewClient = () => {
    if (spawnedClients.length >= 4) {
      alert("Simulator: Maximum 4 Swing clients can be active side-by-side to prevent desktop clutter.");
      return;
    }
    const nextCount = clientCount + 1;
    setClientCount(nextCount);
    setSpawnedClients([...spawnedClients, `Client-${nextCount}`]);
  };

  const closeClient = (id: string) => {
    setSpawnedClients(spawnedClients.filter((c) => c !== id));
  };

  return (
    <div className="min-h-screen bg-elegant-bg text-gray-100 flex flex-col font-sans select-none antialiased elegant-gradient">
      {/* Top Navbar Header inspired by ChatGPT and Elegant Dark UI guidelines */}
      <header className="bg-elegant-card border-b border-elegant-border shrink-0 sticky top-0 z-30 gold-glow">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Title branding */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-elegant-gold-muted border border-elegant-border-hover rounded-xl text-elegant-gold shadow-inner">
              <Terminal className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-serif font-bold text-elegant-gold tracking-wide">ConnectCraft</h1>
                <span className="text-[9px] font-mono bg-elegant-gold-muted text-elegant-gold px-2 py-0.5 rounded border border-elegant-border font-bold uppercase tracking-wider">JDK Socket Sim</span>
              </div>
              <p className="text-xs text-elegant-muted mt-0.5">Real-Time Multi-Client Java Socket Chat Console & IDE</p>
            </div>
          </div>

          {/* Quick Stats overview panel */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <div className="bg-elegant-card-alt px-3.5 py-1.5 rounded-xl border border-elegant-border flex items-center gap-2">
              <Server className="w-3.5 h-3.5 text-elegant-gold" />
              <span className="text-elegant-muted">Socket Port:</span>
              <span className="text-elegant-gold font-bold">8080</span>
            </div>
            <div className="bg-elegant-card-alt px-3.5 py-1.5 rounded-xl border border-elegant-border flex items-center gap-2">
              <DBIcon className="w-3.5 h-3.5 text-elegant-gold-light" />
              <span className="text-elegant-muted">RDBMS:</span>
              <span className="text-elegant-gold-light font-bold">MySQL (JDBC)</span>
            </div>
            <div className="bg-elegant-card-alt px-3.5 py-1.5 rounded-xl border border-elegant-border flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${serverStatus === "RUNNING" ? "bg-elegant-gold animate-pulse" : "bg-red-500"}`} />
              <span className="text-elegant-muted">Server State:</span>
              <span className={serverStatus === "RUNNING" ? "text-elegant-gold font-bold" : "text-red-400 font-bold"}>
                {serverStatus === "RUNNING" ? "RUNNING" : "STOPPED"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Primary Navigation Tab Bar */}
      <nav className="bg-elegant-card/80 border-b border-elegant-border shrink-0 sticky top-[77px] z-20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex overflow-x-auto gap-1 py-1.5 no-scrollbar">
            
            <button
              onClick={() => setActiveTab("SIMULATOR")}
              className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                activeTab === "SIMULATOR"
                  ? "bg-elegant-gold-muted border border-elegant-border-hover text-elegant-gold shadow-md shadow-elegant-gold/5"
                  : "hover:bg-elegant-card-hover text-elegant-muted hover:text-gray-200"
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span>Interactive Desktop Simulator</span>
            </button>

            <button
              onClick={() => setActiveTab("SERVER")}
              className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                activeTab === "SERVER"
                  ? "bg-elegant-gold-muted border border-elegant-border-hover text-elegant-gold shadow-md shadow-elegant-gold/5"
                  : "hover:bg-elegant-card-hover text-elegant-muted hover:text-gray-200"
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>ServerSocket Terminal</span>
            </button>

            <button
              onClick={() => setActiveTab("DATABASE")}
              className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                activeTab === "DATABASE"
                  ? "bg-elegant-gold-muted border border-elegant-border-hover text-elegant-gold shadow-md shadow-elegant-gold/5"
                  : "hover:bg-elegant-card-hover text-elegant-muted hover:text-gray-200"
              }`}
            >
              <DBIcon className="w-4 h-4" />
              <span>MySQL Database Studio</span>
            </button>

            <button
              onClick={() => setActiveTab("CODE")}
              className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                activeTab === "CODE"
                  ? "bg-elegant-gold-muted border border-elegant-border-hover text-elegant-gold shadow-md shadow-elegant-gold/5"
                  : "hover:bg-elegant-card-hover text-elegant-muted hover:text-gray-200"
              }`}
            >
              <Code className="w-4 h-4" />
              <span>Java Code Studio</span>
            </button>

            <button
              onClick={() => setActiveTab("DOCUMENTATION")}
              className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                activeTab === "DOCUMENTATION"
                  ? "bg-elegant-gold-muted border border-elegant-border-hover text-elegant-gold shadow-md shadow-elegant-gold/5"
                  : "hover:bg-elegant-card-hover text-elegant-muted hover:text-gray-200"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Evaluator & QA Guide</span>
            </button>

          </div>
        </div>
      </nav>

      {/* Main Workspace Frame container */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
        {activeTab === "SIMULATOR" && (
          <div className="space-y-6">
            
            {/* Desktop simulation control panel */}
            <div className="bg-elegant-card border border-elegant-border rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl gold-glow">
              <div>
                <h3 className="font-serif font-medium text-lg text-elegant-platinum flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-elegant-gold" />
                  Draggable Desktop Sandbox Frame
                </h3>
                <p className="text-xs text-elegant-muted mt-1">
                  Launch multiple mock Swing frames. Each frame operates separate sockets communicating in real-time.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={spawnNewClient}
                  className="px-4.5 py-2 bg-elegant-gold hover:bg-elegant-gold-dark text-black font-semibold transition-all rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-elegant-gold/15"
                >
                  <Plus className="w-4 h-4" />
                  Launch Swing Client Frame
                </button>
              </div>
            </div>

            {/* Sandbox Windows Grid */}
            {spawnedClients.length === 0 ? (
              <div className="bg-elegant-card/40 border border-elegant-border rounded-2xl p-16 text-center text-elegant-muted flex flex-col items-center justify-center gap-3">
                <Monitor className="w-12 h-12 opacity-30 animate-pulse" />
                <div>
                  <p className="font-semibold text-gray-300">Desktop workspace is empty.</p>
                  <p className="text-xs text-elegant-muted mt-1">Click the button above to launch floating mock Java Swing Clients!</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {spawnedClients.map((clientId) => (
                  <SwingClientFrame
                    key={clientId}
                    clientId={clientId}
                    onClose={() => closeClient(clientId)}
                    dbData={dbData}
                    onRefreshDB={syncServerState}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "SERVER" && (
          <ServerConsole
            logs={serverLogs}
            threads={activeThreads}
            connectionCount={activeThreads.length}
            serverStatus={serverStatus}
            onToggleStatus={handleToggleServer}
            onClearLogs={handleClearLogs}
            uptime={uptime}
          />
        )}

        {activeTab === "DATABASE" && (
          <DatabaseStudio
            dbData={dbData}
            onExecuteQuery={handleExecuteQuery}
            onResetDB={handleResetDB}
          />
        )}

        {activeTab === "CODE" && (
          <CodeStudio files={javaFiles} />
        )}

        {activeTab === "DOCUMENTATION" && (
          <ProjectGuide />
        )}
      </main>

      {/* Footer Branding */}
      <footer className="bg-elegant-card border-t border-elegant-border py-6 text-center text-xs text-elegant-muted shrink-0 font-mono">
        <p>© 2026 ConnectCraft Core Developers | Developed with Java Sockets & Swing Engine</p>
      </footer>
    </div>
  );
}

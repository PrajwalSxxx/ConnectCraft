import React, { useState } from "react";
import { Database, Search, Terminal as ConsoleIcon, Play, RefreshCw, Layers, Check, AlertTriangle } from "lucide-react";
import { Database as DatabaseType } from "../types";

interface DatabaseStudioProps {
  dbData: DatabaseType;
  onExecuteQuery: (query: string) => Promise<{ success: boolean; columns?: string[]; rows?: any[]; error?: string }>;
  onResetDB: () => void;
}

export default function DatabaseStudio({ dbData, onExecuteQuery, onResetDB }: DatabaseStudioProps) {
  const [activeTable, setActiveTable] = useState<keyof DatabaseType>("users");
  const [sqlQuery, setSqlQuery] = useState("SELECT * FROM users;");
  const [queryResult, setQueryResult] = useState<{
    success: boolean;
    columns?: string[];
    rows?: any[];
    affectedRows?: number;
    error?: string;
  } | null>(null);
  const [executing, setExecuting] = useState(false);

  const tableSchemas: Record<keyof DatabaseType, { col: string; type: string; desc: string }[]> = {
    users: [
      { col: "user_id", type: "INT AUTO_INCREMENT (PK)", desc: "Unique user index ID" },
      { col: "name", type: "VARCHAR(100)", desc: "Full display name of client" },
      { col: "username", type: "VARCHAR(50) UNIQUE", desc: "Unique handle for logins" },
      { col: "email", type: "VARCHAR(100) UNIQUE", desc: "Validated contact address" },
      { col: "password_hash", type: "VARCHAR(256)", desc: "SHA-256 secure encrypted key" },
      { col: "profile_picture", type: "VARCHAR(255)", desc: "Image profile URL string" },
      { col: "status", type: "ENUM('ONLINE','OFFLINE')", desc: "Live terminal status monitor" },
      { col: "last_seen", type: "TIMESTAMP", desc: "Last socket interaction ping" },
      { col: "created_at", type: "TIMESTAMP", desc: "Account creation date" },
    ],
    messages: [
      { col: "message_id", type: "INT AUTO_INCREMENT (PK)", desc: "Unique message identifier" },
      { col: "sender_id", type: "INT (FK)", desc: "References users.user_id" },
      { col: "receiver_id", type: "INT (FK, NULL)", desc: "References target user_id (1-to-1)" },
      { col: "group_id", type: "INT (FK, NULL)", desc: "References target groups.group_id" },
      { col: "message", type: "TEXT", desc: "Main content of message string" },
      { col: "message_type", type: "ENUM('TEXT','IMAGE','DOC')", desc: "Indicates stream type classification" },
      { col: "file_path", type: "VARCHAR(255)", desc: "Local folder mapping for uploads" },
      { col: "timestamp", type: "TIMESTAMP", desc: "Database server-time stamp" },
    ],
    groups: [
      { col: "group_id", type: "INT AUTO_INCREMENT (PK)", desc: "Unique group identifier index" },
      { col: "group_name", type: "VARCHAR(100)", desc: "Descriptive name of chatroom" },
      { col: "created_by", type: "INT (FK)", desc: "References user_id who created it" },
      { col: "created_at", type: "TIMESTAMP", desc: "Creation date" },
    ],
    group_members: [
      { col: "group_id", type: "INT (Composite PK/FK)", desc: "References groups.group_id" },
      { col: "user_id", type: "INT (Composite PK/FK)", desc: "References users.user_id" },
    ],
    chat_logs: [
      { col: "log_id", type: "INT AUTO_INCREMENT (PK)", desc: "Activity index log ID" },
      { col: "user_id", type: "INT (FK, NULL)", desc: "References users.user_id" },
      { col: "activity", type: "VARCHAR(255)", desc: "Description of log actions" },
      { col: "timestamp", type: "TIMESTAMP", desc: "Activity trigger time" },
    ],
  };

  const handleRunSQL = async () => {
    if (!sqlQuery.trim()) return;
    setExecuting(true);
    try {
      const res = await onExecuteQuery(sqlQuery);
      setQueryResult(res);
    } catch (e: any) {
      setQueryResult({ success: false, error: e.message });
    } finally {
      setExecuting(false);
    }
  };

  const loadPresetQuery = (query: string) => {
    setSqlQuery(query);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 text-gray-100 font-sans">
      {/* Tables List Sidebar */}
      <div className="xl:col-span-1 space-y-4">
        <div className="bg-elegant-card border border-elegant-border rounded-2xl p-5 shadow-xl gold-glow">
          <h3 className="font-semibold text-sm text-elegant-gold uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Database className="w-4 h-4 text-elegant-gold" />
            MySQL Schema Studio
          </h3>
          <div className="space-y-1.5">
            {(Object.keys(tableSchemas) as Array<keyof DatabaseType>).map((tbl) => (
              <button
                key={tbl}
                onClick={() => {
                  setActiveTable(tbl);
                  loadPresetQuery(`SELECT * FROM ${tbl};`);
                }}
                className={`w-full flex justify-between items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTable === tbl
                    ? "bg-elegant-gold-muted border border-elegant-border-hover text-elegant-gold shadow-md shadow-elegant-gold/5"
                    : "bg-elegant-card-alt border border-elegant-border hover:bg-elegant-card-hover text-elegant-muted"
                }`}
              >
                <span className="font-mono">{tbl}</span>
                <span className="text-xs bg-elegant-bg px-2.5 py-0.5 rounded-full text-elegant-gold font-semibold border border-elegant-border">
                  {dbData[tbl]?.length || 0}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-6 pt-5 border-t border-elegant-border/60 space-y-3">
            <button
              onClick={onResetDB}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-elegant-card-alt border border-elegant-border hover:bg-elegant-card-hover rounded-xl text-xs font-semibold text-gray-300 hover:text-white transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Database & Re-Seed
            </button>
          </div>
        </div>

        {/* Database parameters Card */}
        <div className="bg-elegant-card border border-elegant-border rounded-2xl p-5 shadow-xl text-xs space-y-3 text-elegant-muted gold-glow">
          <div className="flex justify-between border-b border-elegant-border/50 pb-2">
            <span>RDBMS:</span>
            <span className="text-gray-200 font-mono font-medium">MySQL Server 8.0.33</span>
          </div>
          <div className="flex justify-between border-b border-elegant-border/50 pb-2">
            <span>JDBC URL:</span>
            <span className="text-gray-200 font-mono text-[10px]">jdbc:mysql://127.0.0.1:3306</span>
          </div>
          <div className="flex justify-between">
            <span>Database Name:</span>
            <span className="text-elegant-gold font-mono font-medium">connectcraft_chat</span>
          </div>
        </div>
      </div>

      {/* SQL console & table contents */}
      <div className="xl:col-span-3 space-y-6">
        {/* SQL Query Console */}
        <div className="bg-elegant-card border border-elegant-border rounded-2xl p-6 shadow-xl flex flex-col gold-glow">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <ConsoleIcon className="w-5 h-5 text-elegant-gold" />
              <h3 className="font-serif font-semibold text-lg text-gray-100">MySQL SQL Executer Console</h3>
            </div>
            {/* Presets query list */}
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                onClick={() => loadPresetQuery("SELECT * FROM users;")}
                className="px-2.5 py-1 bg-elegant-card-alt border border-elegant-border hover:bg-elegant-card-hover rounded-lg text-elegant-muted hover:text-elegant-gold transition-colors cursor-pointer"
              >
                SELECT users
              </button>
              <button
                onClick={() => loadPresetQuery("SELECT * FROM messages WHERE message_type = 'TEXT';")}
                className="px-2.5 py-1 bg-elegant-card-alt border border-elegant-border hover:bg-elegant-card-hover rounded-lg text-elegant-muted hover:text-elegant-gold transition-colors cursor-pointer"
              >
                SELECT text msg
              </button>
              <button
                onClick={() => loadPresetQuery("SELECT * FROM chat_logs ORDER BY timestamp DESC;")}
                className="px-2.5 py-1 bg-elegant-card-alt border border-elegant-border hover:bg-elegant-card-hover rounded-lg text-elegant-muted hover:text-elegant-gold transition-colors cursor-pointer"
              >
                SELECT logs
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1 bg-elegant-bg rounded-xl p-3 border border-elegant-border font-mono text-elegant-gold-light text-sm">
              <textarea
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                className="w-full bg-transparent border-none outline-none focus:ring-0 resize-none h-16 font-mono text-elegant-gold-light"
                placeholder="Write MySQL query here..."
              />
            </div>
            <button
              onClick={handleRunSQL}
              disabled={executing}
              className="px-5 py-3 bg-elegant-gold hover:bg-elegant-gold-dark disabled:bg-elegant-card-alt rounded-xl font-bold flex flex-col justify-center items-center gap-1.5 transition-all text-black shrink-0 cursor-pointer shadow-lg shadow-elegant-gold/15"
            >
              <Play className="w-5 h-5" />
              <span className="text-[10px] uppercase tracking-wider">Execute</span>
            </button>
          </div>

          {/* Console results block */}
          {queryResult && (
            <div className="mt-4 p-4 rounded-xl border font-mono text-xs max-h-48 overflow-y-auto bg-elegant-bg/50 border-elegant-border">
              {queryResult.success ? (
                <div>
                  <div className="text-elegant-gold flex items-center gap-1.5 mb-2 font-semibold">
                    <Check className="w-4 h-4" />
                    Query executed successfully. Affected rows: {queryResult.affectedRows ?? queryResult.rows?.length ?? 0}
                  </div>
                  {queryResult.rows && queryResult.rows.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-gray-300">
                        <thead>
                          <tr className="border-b border-elegant-border">
                            {queryResult.columns?.map((col) => (
                              <th key={col} className="pb-1.5 pr-4 font-semibold text-elegant-muted font-mono">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {queryResult.rows.map((row, i) => (
                            <tr key={i} className="border-b border-elegant-border/40 hover:bg-elegant-card-hover/20">
                              {queryResult.columns?.map((col) => (
                                <td key={col} className="py-1.5 pr-4 max-w-xs truncate font-mono text-elegant-gold-light">
                                  {typeof row[col] === "object" ? JSON.stringify(row[col]) : String(row[col] ?? "NULL")}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-elegant-muted italic">Empty result set.</p>
                  )}
                </div>
              ) : (
                <div className="text-red-400 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold">MySQL Error: </span>
                    <span>{queryResult.error}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Selected Table Grid Viewer */}
        <div className="bg-elegant-card border border-elegant-border rounded-2xl p-6 shadow-xl space-y-6 gold-glow">
          <div>
            <h3 className="font-serif font-semibold text-lg text-gray-100 flex items-center gap-2 mb-1">
              <Layers className="w-5 h-5 text-elegant-gold" />
              Live Table Viewer: <span className="font-mono text-elegant-gold">{activeTable}</span>
            </h3>
            <p className="text-xs text-elegant-muted">Inspecting database table contents in real-time</p>
          </div>

          {/* Table Schema mapping */}
          <div className="bg-elegant-bg p-4 rounded-xl border border-elegant-border">
            <h4 className="font-semibold text-xs text-elegant-muted uppercase tracking-wider mb-2.5">Field Schema Declarations</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {tableSchemas[activeTable].map((s) => (
                <div key={s.col} className="bg-elegant-card-alt p-2.5 rounded-lg border border-elegant-border/80">
                  <div className="flex justify-between font-mono mb-1">
                    <span className="font-semibold text-gray-200">{s.col}</span>
                    <span className="text-elegant-gold font-semibold text-[10px]">{s.type}</span>
                  </div>
                  <p className="text-elegant-muted font-sans leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Table Rows List */}
          <div className="overflow-x-auto rounded-xl border border-elegant-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-elegant-card-alt text-elegant-muted font-mono text-xs border-b border-elegant-border">
                <tr>
                  {tableSchemas[activeTable].map((s) => (
                    <th key={s.col} className="px-4 py-3 font-semibold">
                      {s.col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-elegant-border/60 bg-elegant-bg/10 font-mono text-xs text-gray-300">
                {(!dbData[activeTable] || dbData[activeTable].length === 0) ? (
                  <tr>
                    <td colSpan={tableSchemas[activeTable].length} className="px-4 py-6 text-center text-elegant-muted italic">
                      Table is currently empty. Add records via client operations.
                    </td>
                  </tr>
                ) : (
                  dbData[activeTable].map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-elegant-card-hover/30 transition-all">
                      {tableSchemas[activeTable].map((s) => (
                        <td key={s.col} className="px-4 py-3 max-w-xs truncate text-elegant-gold-light">
                          {typeof row[s.col] === "object" ? JSON.stringify(row[s.col]) : String(row[s.col] ?? "NULL")}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

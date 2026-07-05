import React, { useState, useEffect, useRef } from "react";
import { Terminal, Cpu, Users, Layers, Activity, Power, RefreshCw, Trash2 } from "lucide-react";
import { JavaServerLog, SimulatedThread } from "../types";

interface ServerConsoleProps {
  logs: JavaServerLog[];
  threads: SimulatedThread[];
  connectionCount: number;
  serverStatus: "RUNNING" | "STOPPED";
  onToggleStatus: () => void;
  onClearLogs: () => void;
  uptime: number;
}

export default function ServerConsole({
  logs,
  threads,
  connectionCount,
  serverStatus,
  onToggleStatus,
  onClearLogs,
  uptime,
}: ServerConsoleProps) {
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const [filterLevel, setFilterLevel] = useState<"ALL" | "INFO" | "WARNING" | "SEVERE">("ALL");

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const filteredLogs = logs.filter(
    (l) => filterLevel === "ALL" || l.level === filterLevel
  );

  const formatUptime = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = Math.floor(sec % 60);
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-gray-100 font-sans">
      {/* Server Controls & KPI Cards */}
      <div className="lg:col-span-1 space-y-6">
        {/* Status Controller */}
        <div className="bg-elegant-card border border-elegant-border rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-md gold-glow">
          <div className="absolute top-0 right-0 w-24 h-24 bg-elegant-gold/5 blur-3xl rounded-full" />
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-serif font-bold text-lg text-elegant-gold">Socket Controller</h3>
              <p className="text-xs text-elegant-muted">Configure Java ServerSocketState</p>
            </div>
            <button
              onClick={onToggleStatus}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-md cursor-pointer ${
                serverStatus === "RUNNING"
                  ? "bg-elegant-gold hover:bg-elegant-gold-dark text-black shadow-elegant-gold/10"
                  : "bg-red-600 hover:bg-red-700 text-white shadow-red-500/10"
              }`}
            >
              <Power className="w-4 h-4" />
              {serverStatus === "RUNNING" ? "ACTIVE" : "OFFLINE"}
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm border-b border-elegant-border/60 pb-2">
              <span className="text-elegant-muted">Binding Port:</span>
              <span className="font-mono font-semibold text-elegant-gold">8080 (TCP)</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-elegant-border/60 pb-2">
              <span className="text-elegant-muted">Class Endpoint:</span>
              <span className="font-mono text-gray-300">server.ChatServer</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-elegant-border/60 pb-2">
              <span className="text-elegant-muted">Server Uptime:</span>
              <span className="font-mono text-elegant-gold-light font-semibold">{formatUptime(uptime)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-elegant-muted">Active Pool:</span>
              <span className="font-semibold text-elegant-gold">java.util.concurrent.Executors</span>
            </div>
          </div>
        </div>

        {/* Server Metrics Dashboard */}
        <div className="bg-elegant-card border border-elegant-border rounded-2xl p-6 shadow-xl space-y-4 gold-glow">
          <h3 className="font-semibold text-xs text-elegant-muted uppercase tracking-wider">Telemetry Accents</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-elegant-card-alt p-4 rounded-xl border border-elegant-border">
              <div className="flex justify-between items-start mb-2 text-elegant-gold">
                <Users className="w-5 h-5" />
                <span className="text-[10px] bg-elegant-gold-muted px-1.5 py-0.5 rounded text-elegant-gold font-mono border border-elegant-border">Live</span>
              </div>
              <p className="text-2xl font-bold text-gray-100">{connectionCount}</p>
              <p className="text-xs text-elegant-muted">Active Sockets</p>
            </div>

            <div className="bg-elegant-card-alt p-4 rounded-xl border border-elegant-border">
              <div className="flex justify-between items-start mb-2 text-elegant-gold-light">
                <Layers className="w-5 h-5" />
                <span className="text-[10px] bg-elegant-gold-muted px-1.5 py-0.5 rounded text-elegant-gold-light font-mono border border-elegant-border">Pool</span>
              </div>
              <p className="text-2xl font-bold text-gray-100">{connectionCount}</p>
              <p className="text-xs text-elegant-muted">Thread Count</p>
            </div>
          </div>

          <div className="bg-elegant-card-alt p-4 rounded-xl border border-elegant-border space-y-2">
            <div className="flex justify-between text-xs text-elegant-muted">
              <span>Simulated CPU Allocation</span>
              <span className="text-elegant-gold font-mono">4.2%</span>
            </div>
            <div className="h-1.5 bg-elegant-bg rounded-full overflow-hidden border border-elegant-border">
              <div className="h-full bg-elegant-gold rounded-full" style={{ width: "4.2%" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Server Output Terminal */}
      <div className="lg:col-span-2 bg-elegant-card border border-elegant-border rounded-2xl shadow-xl flex flex-col h-[520px] gold-glow">
        {/* Terminal Header */}
        <div className="bg-elegant-card-alt px-5 py-3.5 border-b border-elegant-border/80 flex justify-between items-center rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-elegant-gold inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-elegant-gold-light inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-elegant-gold-dark inline-block" />
            </div>
            <span className="text-xs text-elegant-muted font-mono">/logs/stdout - ChatServer.log</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-elegant-bg border border-elegant-border rounded-lg p-0.5 text-xs">
              {(["ALL", "INFO", "WARNING", "SEVERE"] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setFilterLevel(lvl)}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    filterLevel === lvl
                      ? "bg-elegant-gold text-black shadow"
                      : "text-elegant-muted hover:text-gray-200"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
            <button
              onClick={onClearLogs}
              title="Clear Console Output"
              className="p-1.5 hover:bg-elegant-card-hover rounded-lg text-elegant-muted hover:text-red-400 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Terminal Log Streams */}
        <div className="flex-1 p-5 overflow-y-auto font-mono text-xs space-y-2 bg-elegant-bg/40 scrollbar-thin">
          {filteredLogs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-elegant-muted gap-2">
              <Terminal className="w-8 h-8 opacity-40 animate-pulse text-elegant-gold" />
              <p className="text-xs">Console is clean. No logged socket actions.</p>
            </div>
          ) : (
            filteredLogs.map((log, i) => {
              const dateStr = new Date(log.timestamp).toLocaleTimeString();
              let textClass = "text-elegant-gold-light/90";
              let badgeClass = "text-elegant-gold bg-elegant-gold-muted border-elegant-border";
              
              if (log.level === "WARNING") {
                textClass = "text-yellow-400/95";
                badgeClass = "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
              } else if (log.level === "SEVERE") {
                textClass = "text-red-400";
                badgeClass = "text-red-400 bg-red-500/10 border-red-500/20";
              }

              return (
                <div key={i} className={`leading-relaxed border-l-2 pl-3 py-0.5 border-elegant-border transition-colors hover:bg-elegant-card-hover/40 flex items-start gap-2.5 ${textClass}`}>
                  <span className="text-elegant-muted select-none text-xs whitespace-nowrap mt-0.5">{dateStr}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border leading-none shrink-0 ${badgeClass}`}>{log.level}</span>
                  <span className="break-all">{log.message}</span>
                </div>
              );
            })
          )}
          <div ref={terminalEndRef} />
        </div>

        {/* Thread Sockets Registry */}
        <div className="bg-elegant-card-alt p-4 border-t border-elegant-border/80">
          <h4 className="font-semibold text-xs text-elegant-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-elegant-gold" />
            Active Java Threads Registry ({threads.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {threads.length === 0 ? (
              <p className="text-elegant-muted italic py-1 col-span-2">No clients connected. Launch Client frames above to allocate threads.</p>
            ) : (
              threads.map((thread) => (
                <div key={thread.threadId} className="bg-elegant-bg p-2.5 rounded-lg border border-elegant-border flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-elegant-gold">{thread.threadId}</p>
                    <p className="text-elegant-muted mt-0.5 font-mono text-[10px]">
                      IP: <span className="text-elegant-gold-light">{thread.ip}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-200 font-semibold">{thread.username ? `UID: ${thread.userId} (${thread.username})` : "UNAUTHENTICATED"}</p>
                    <span className="text-[10px] text-elegant-gold">Connected</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

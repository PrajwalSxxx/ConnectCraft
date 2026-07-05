import React from "react";
import { Award, BookOpen, Layers, Zap, HardDrive, CheckCircle2, ShieldAlert } from "lucide-react";

export default function ProjectGuide() {
  return (
    <div className="space-y-8 text-gray-100 max-w-4xl mx-auto pb-8 font-sans">
      {/* Introduction Card */}
      <div className="bg-elegant-card border border-elegant-border rounded-2xl p-6 shadow-xl relative overflow-hidden gold-glow">
        <div className="absolute top-0 right-0 w-36 h-36 bg-elegant-gold/5 blur-3xl rounded-full" />
        <div className="flex gap-4">
          <div className="p-3 bg-elegant-gold-muted border border-elegant-border-hover rounded-xl text-elegant-gold self-start">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-xl text-elegant-gold mb-1.5">MCA Mini-Project Evaluator Guide</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              Welcome to the <strong>ConnectCraft</strong> Project Documentation. This section contains all structural charts,
              software engineering requirements, and testing procedures required to showcase this Java socket programming chat system
              during code reviews, viva-voces, or project evaluation committees.
            </p>
          </div>
        </div>
      </div>

      {/* Three-Tier Architecture Map */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-elegant-card border border-elegant-border p-5 rounded-xl space-y-3 gold-glow-hover transition-all">
          <div className="flex items-center gap-2 text-elegant-gold font-bold text-sm">
            <Layers className="w-4 h-4" />
            <span>1. Presentation Layer</span>
          </div>
          <p className="text-xs text-elegant-muted leading-relaxed">
            Constructed with **Java Swing** and FlatLaf dark theme layout styling. Contains highly organized panels using
            `GridBagLayout` and `BorderLayout` to handle responsive controls, text streams, and file transfers.
          </p>
        </div>

        <div className="bg-elegant-card border border-elegant-border p-5 rounded-xl space-y-3 gold-glow-hover transition-all">
          <div className="flex items-center gap-2 text-elegant-gold font-bold text-sm">
            <Zap className="w-4 h-4" />
            <span>2. Business Logic Layer</span>
          </div>
          <p className="text-xs text-elegant-muted leading-relaxed">
            Coordinated via the **Java Socket API** (`ServerSocket`, `Socket`). Employs a thread pool executors container to allocate
            distinct execution channels for every client session handler.
          </p>
        </div>

        <div className="bg-elegant-card border border-elegant-border p-5 rounded-xl space-y-3 gold-glow-hover transition-all">
          <div className="flex items-center gap-2 text-elegant-gold font-bold text-sm">
            <HardDrive className="w-4 h-4" />
            <span>3. Database Storage Layer</span>
          </div>
          <p className="text-xs text-elegant-muted leading-relaxed">
            Supported by a **MySQL Database** schema and connected via JDBC drivers with a **HikariCP** high-performance connection pool
            to persist chat records, registered profiles, and logs.
          </p>
        </div>
      </div>

      {/* Testing Scenarios Matrix */}
      <div className="bg-elegant-card border border-elegant-border rounded-2xl p-6 shadow-xl space-y-4 gold-glow">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-5 h-5 text-elegant-gold" />
          <h3 className="font-serif font-semibold text-lg text-gray-100">Functional Testing Checklist</h3>
        </div>

        <div className="space-y-4">
          <div className="border-b border-elegant-border/40 pb-4">
            <h4 className="font-semibold text-sm text-elegant-gold flex items-center gap-1.5 mb-1.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Test Case 01: Multi-Thread Client Socket Allocation
            </h4>
            <p className="text-xs text-elegant-muted leading-relaxed pl-5">
              <strong>Objective:</strong> Verify that the ServerSocket spawns distinct independent threads for multiple concurrent client sockets.
              <br />
              <strong>Procedure:</strong> Launch three parallel ChatClient Swing instances, log in as separate accounts, and verify that the 
              `ChatServer` logs and the Thread Monitor on the dashboard display three concurrent threads (`CC-SocketThread-...`).
            </p>
          </div>

          <div className="border-b border-elegant-border/40 pb-4">
            <h4 className="font-semibold text-sm text-elegant-gold flex items-center gap-1.5 mb-1.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Test Case 02: Real-Time Chat Message Propagation
            </h4>
            <p className="text-xs text-elegant-muted leading-relaxed pl-5">
              <strong>Objective:</strong> Confirm that private and group chat messages propagate instantly without screen refreshes.
              <br />
              <strong>Procedure:</strong> Arrange two client frames side-by-side. Type in Client A, watch typing indicators display in Client B, and verify 
              message bubbles render instantly on both screens when clicking Send.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-red-400 flex items-center gap-1.5 mb-1.5">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              Exception & Recovery: Abrupt Socket Disconnections
            </h4>
            <p className="text-xs text-elegant-muted leading-relaxed pl-5">
              <strong>Objective:</strong> Handle abrupt connections dropped by clients or socket interruptions gracefully.
              <br />
              <strong>Procedure:</strong> Kill a client process directly. Verify that the Server's `ClientHandler` catches the `IOException`,
              unregisters the client, sets their status to `OFFLINE` in the database, and frees memory resources without crashing the ServerSocket.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

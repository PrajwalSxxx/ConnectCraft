import React, { useState, useEffect, useRef } from "react";
import { 
  X, Minus, Square, Terminal, User as UserIcon, LogOut, 
  Send, Paperclip, Smile, Shield, Layers, Users, Key, Mail, Check, AlertTriangle 
} from "lucide-react";
import { User, Message, Group, Database } from "../types";

interface SwingClientFrameProps {
  key?: any;
  clientId: string;
  onClose: () => void;
  dbData: Database;
  onRefreshDB: () => any;
}

export default function SwingClientFrame({ clientId, onClose, dbData, onRefreshDB }: SwingClientFrameProps) {
  const [screen, setScreen] = useState<"SPLASH" | "LOGIN" | "REGISTER" | "DASHBOARD" | "CHAT" | "PROFILE" | "GROUP_CREATE">("SPLASH");
  const [splashProgress, setSplashProgress] = useState(0);
  const [threadId, setThreadId] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);

  // Form Fields
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorText, setErrorText] = useState("");

  // Register Fields
  const [regName, setRegName] = useState("");
  const [regUser, setRegUser] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");
  const [regConfirmPass, setRegConfirmPass] = useState("");

  // Profile Fields
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");

  // Group Fields
  const [groupName, setGroupName] = useState("");
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<number[]>([]);

  // Authenticated User
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Chat State
  const [selectedChat, setSelectedChat] = useState<"BROADCAST" | { type: "USER" | "GROUP"; id: number }>("BROADCAST");
  const [messageText, setMessageText] = useState("");
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Establish Separate WebSocket Connection for this Swing Client
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    const socketUrl = `${protocol}//${host}/ws`;

    const socket = new WebSocket(socketUrl);

    socket.onopen = () => {
      console.log(`[SwingClient ${clientId}] Connected to mock Java Socket Server.`);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const { type, payload } = data;

        switch (type) {
          case "server:thread_assigned":
            setThreadId(payload.threadId);
            setIpAddress(payload.ip);
            break;

          case "server:register_response":
            if (payload.success) {
              setScreen("LOGIN");
              setErrorText("");
              alert("Swing Client: Registration Succeeded! Please log in.");
            } else {
              setErrorText(payload.error || "Registration failed.");
            }
            break;

          case "server:login_response":
            if (payload.success) {
              setCurrentUser(payload.user);
              setProfileName(payload.user.name);
              setProfileEmail(payload.user.email);
              setScreen("DASHBOARD");
              setErrorText("");
              // Quick trigger DB refresh
              onRefreshDB();
            } else {
              setErrorText(payload.error || "Authentication failed.");
            }
            break;

          case "server:message":
            // Trigger quick beep
            try {
              const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
              const osc = audioCtx.createOscillator();
              const gainNode = audioCtx.createGain();
              osc.type = "sine";
              osc.frequency.setValueAtTime(600, audioCtx.currentTime);
              gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
              osc.connect(gainNode);
              gainNode.connect(audioCtx.destination);
              osc.start();
              osc.stop(audioCtx.currentTime + 0.1);
            } catch (e) {}

            onRefreshDB();
            break;

          case "server:typing":
            if (currentUser && payload.user_id !== currentUser.user_id) {
              // Only process typing if it matches our active chat
              const targetTyping = payload.is_typing;
              const senderUser = dbData.users.find(u => u.user_id === payload.user_id);
              if (senderUser) {
                setTypingUsers(prev => ({
                  ...prev,
                  [senderUser.username]: targetTyping
                }));
              }
            }
            break;

          case "server:user_status":
          case "server:sync_db":
            onRefreshDB();
            break;

          case "server:force_logout":
            alert(`You have been disconnected: ${payload.reason}`);
            handleLogout();
            break;
        }
      } catch (err) {
        console.error("Failed to parse WS payload inside Swing Frame", err);
      }
    };

    socket.onclose = () => {
      console.log(`[SwingClient ${clientId}] Socket closed.`);
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, [clientId]);

  // Splash loader trigger
  useEffect(() => {
    if (screen === "SPLASH") {
      const interval = setInterval(() => {
        setSplashProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setScreen("LOGIN");
            return 100;
          }
          return prev + 10;
        });
      }, 150);
      return () => clearInterval(interval);
    }
  }, [screen]);

  // Scroll chat to bottom on load
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [dbData.messages, screen, selectedChat]);

  // Trigger typing indicators to server
  const sendTypingStatus = (isTyping: boolean) => {
    if (!ws || ws.readyState !== WebSocket.OPEN || !currentUser) return;
    let target_id = null;
    let group_id = null;

    if (selectedChat !== "BROADCAST") {
      if (selectedChat.type === "USER") target_id = selectedChat.id;
      else group_id = selectedChat.id;
    }

    ws.send(JSON.stringify({
      type: "client:typing",
      payload: {
        user_id: currentUser.user_id,
        target_id,
        group_id,
        is_typing: isTyping
      }
    }));
  };

  const handleLogin = () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    if (!usernameInput || !passwordInput) {
      setErrorText("Please fill in both coordinates.");
      return;
    }
    ws.send(JSON.stringify({
      type: "client:login",
      payload: { username: usernameInput, password: passwordInput }
    }));
  };

  const handleRegister = () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    if (!regName || !regUser || !regEmail || !regPass || !regConfirmPass) {
      setErrorText("All parameters are strictly required.");
      return;
    }
    if (regPass !== regConfirmPass) {
      setErrorText("Password confirmations do not match.");
      return;
    }
    ws.send(JSON.stringify({
      type: "client:register",
      payload: {
        name: regName,
        username: regUser.toLowerCase(),
        email: regEmail,
        password: regPass
      }
    }));
  };

  const handleLogout = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "client:logout", payload: {} }));
    }
    setCurrentUser(null);
    setScreen("LOGIN");
  };

  const handleSendMessage = () => {
    if (!ws || ws.readyState !== WebSocket.OPEN || !currentUser || !messageText.trim()) return;

    let receiver_id = null;
    let group_id = null;

    if (selectedChat !== "BROADCAST") {
      if (selectedChat.type === "USER") receiver_id = selectedChat.id;
      else group_id = selectedChat.id;
    }

    ws.send(JSON.stringify({
      type: "client:message",
      payload: {
        sender_id: currentUser.user_id,
        receiver_id,
        group_id,
        message: messageText.trim(),
        message_type: "TEXT"
      }
    }));

    setMessageText("");
    sendTypingStatus(false);
  };

  // Profile editing
  const handleUpdateProfile = () => {
    if (!ws || ws.readyState !== WebSocket.OPEN || !currentUser) return;
    ws.send(JSON.stringify({
      type: "client:update_profile",
      payload: {
        user_id: currentUser.user_id,
        name: profileName,
        email: profileEmail
      }
    }));
    setScreen("DASHBOARD");
  };

  // Group creation
  const handleCreateGroup = () => {
    if (!ws || ws.readyState !== WebSocket.OPEN || !currentUser || !groupName.trim()) return;
    ws.send(JSON.stringify({
      type: "client:create_group",
      payload: {
        group_name: groupName,
        created_by: currentUser.user_id,
        members: [...selectedGroupMembers, currentUser.user_id]
      }
    }));
    setScreen("DASHBOARD");
    setGroupName("");
    setSelectedGroupMembers([]);
  };

  // Upload attachment
  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser || !ws) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = (reader.result as string).split(",")[1];
      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: file.name,
            type: file.type,
            data: base64Data,
            senderId: currentUser.user_id
          })
        });
        const res = await response.json();
        if (res.success) {
          let receiver_id = null;
          let group_id = null;

          if (selectedChat !== "BROADCAST") {
            if (selectedChat.type === "USER") receiver_id = selectedChat.id;
            else group_id = selectedChat.id;
          }

          ws.send(JSON.stringify({
            type: "client:message",
            payload: {
              sender_id: currentUser.user_id,
              receiver_id,
              group_id,
              message: `📎 Shared file: ${file.name}`,
              message_type: file.type.startsWith("image/") ? "IMAGE" : "DOCUMENT",
              file_path: res.fileUrl
            }
          }));
        }
      } catch (err) {
        console.error("Upload error inside frame", err);
      }
    };
    reader.readAsDataURL(file);
  };

  // Filter messages based on selected chat
  const getFilteredMessages = () => {
    return dbData.messages.filter((msg) => {
      if (selectedChat === "BROADCAST") {
        return msg.receiver_id === null && msg.group_id === null;
      }
      if (selectedChat.type === "GROUP") {
        return msg.group_id === selectedChat.id;
      }
      // One-to-one
      return (
        (msg.sender_id === currentUser?.user_id && msg.receiver_id === selectedChat.id) ||
        (msg.sender_id === selectedChat.id && msg.receiver_id === currentUser?.user_id)
      );
    });
  };

  const activeTypingUsernames = Object.keys(typingUsers).filter(username => typingUsers[username]);

  return (
    <div className="bg-elegant-card border-2 border-elegant-gold rounded-xl overflow-hidden shadow-2xl h-[560px] flex flex-col font-sans select-none relative gold-glow">
      {/* Java Swing Frame Header Title Bar */}
      <div className="bg-elegant-card-alt px-4 py-2 flex justify-between items-center border-b border-elegant-border cursor-default select-none shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-elegant-gold" />
          <span className="text-[11px] font-mono font-semibold tracking-wide text-elegant-muted">
            ConnectCraft UI Terminal [Thread: {threadId || "ALLOCATING..."}]
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-gray-500 hover:text-gray-300 transition-colors">
            <Minus className="w-3 h-3" />
          </button>
          <button className="text-gray-500 hover:text-gray-300 transition-colors">
            <Square className="w-2.5 h-2.5" />
          </button>
          <button 
            onClick={onClose}
            className="text-red-500 hover:text-white hover:bg-red-600 rounded p-0.5 transition-all cursor-pointer"
            title="Terminate Socket Thread"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Frame Client Area Content */}
      <div className="flex-1 overflow-hidden relative flex flex-col bg-elegant-bg/95 text-gray-200">
        
        {/* SCREEN 1: SPLASH SCREEN */}
        {screen === "SPLASH" && (
          <div className="absolute inset-0 flex flex-col justify-center items-center bg-elegant-bg z-20">
            <div className="space-y-4 text-center max-w-xs">
              <h2 className="text-3xl font-serif font-extrabold tracking-wider text-elegant-gold">ConnectCraft</h2>
              <p className="text-[11px] uppercase tracking-widest text-elegant-muted">FlatDarkLaf Swing Canvas</p>
              
              <div className="pt-8">
                <div className="h-1.5 w-48 bg-elegant-card rounded-full overflow-hidden mx-auto border border-elegant-border">
                  <div className="h-full bg-elegant-gold rounded-full transition-all duration-150" style={{ width: `${splashProgress}%` }} />
                </div>
                <span className="text-[9px] font-mono text-elegant-gold block mt-2">Loading JDK Socket streams: {splashProgress}%</span>
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 2: LOGIN SCREEN */}
        {screen === "LOGIN" && (
          <div className="flex-1 flex flex-col justify-center p-8 max-w-sm mx-auto w-full">
            <div className="mb-6 text-center">
              <h3 className="text-2xl font-serif font-bold text-elegant-gold">Welcome Back</h3>
              <p className="text-xs text-elegant-muted">Authenticating Swing Socket credentials</p>
            </div>

            {errorText && (
              <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex gap-2 items-start text-xs text-red-400">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorText}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-elegant-muted block mb-1">Username Handle</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className="w-full bg-elegant-card border border-elegant-border focus:border-elegant-gold/40 rounded-xl py-2 pl-10 pr-4 text-sm text-gray-100 outline-none transition-colors"
                    placeholder="e.g. prajwal"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-elegant-muted block mb-1">Secret Key Coordinate</label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full bg-elegant-card border border-elegant-border focus:border-elegant-gold/40 rounded-xl py-2 pl-10 pr-4 text-sm text-gray-100 outline-none transition-colors"
                    placeholder="Password coordinate"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-elegant-muted">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} className="accent-elegant-gold" />
                  <span>Remember Thread</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={showPassword} onChange={() => setShowPassword(!showPassword)} className="accent-elegant-gold" />
                  <span>Show Coordinate</span>
                </label>
              </div>

              <button
                onClick={handleLogin}
                className="w-full py-2.5 bg-elegant-gold hover:bg-elegant-gold-dark transition-colors font-bold text-sm text-black rounded-xl shadow-lg shadow-elegant-gold/15 cursor-pointer"
              >
                Request Authorization
              </button>

              <button
                onClick={() => {
                  setScreen("REGISTER");
                  setErrorText("");
                }}
                className="w-full text-center text-elegant-gold hover:text-elegant-gold-light text-xs py-1 cursor-pointer"
              >
                No Coordinate Key? Register New Node
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 3: REGISTER SCREEN */}
        {screen === "REGISTER" && (
          <div className="flex-1 flex flex-col justify-center p-6 max-w-sm mx-auto w-full overflow-y-auto scrollbar-thin">
            <div className="mb-4 text-center">
              <h3 className="text-xl font-serif font-bold text-elegant-gold">Register New Client Node</h3>
              <p className="text-[10px] text-elegant-muted">Initialize identity values to MySQL DB</p>
            </div>

            {errorText && (
              <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl p-2.5 flex gap-2 items-start text-xs text-red-400">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorText}</span>
              </div>
            )}

            <div className="space-y-2.5">
              <div>
                <label className="text-[10px] font-semibold text-elegant-muted block mb-0.5">Full Character Name</label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full bg-elegant-card border border-elegant-border focus:border-elegant-gold/40 rounded-lg px-3 py-1.5 text-xs outline-none transition-colors"
                  placeholder="Character display name"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-elegant-muted block mb-0.5">Username Handle</label>
                <input
                  type="text"
                  value={regUser}
                  onChange={(e) => setRegUser(e.target.value)}
                  className="w-full bg-elegant-card border border-elegant-border focus:border-elegant-gold/40 rounded-lg px-3 py-1.5 text-xs outline-none transition-colors"
                  placeholder="Unique handle"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-elegant-muted block mb-0.5">Contact Mail Address</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full bg-elegant-card border border-elegant-border focus:border-elegant-gold/40 rounded-lg px-3 py-1.5 text-xs outline-none transition-colors"
                  placeholder="user@mail.com"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-elegant-muted block mb-0.5">Secure Coordinate Key</label>
                <input
                  type="password"
                  value={regPass}
                  onChange={(e) => setRegPass(e.target.value)}
                  className="w-full bg-elegant-card border border-elegant-border focus:border-elegant-gold/40 rounded-lg px-3 py-1.5 text-xs outline-none transition-colors"
                  placeholder="6+ characters"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-elegant-muted block mb-0.5">Confirm Key</label>
                <input
                  type="password"
                  value={regConfirmPass}
                  onChange={(e) => setRegConfirmPass(e.target.value)}
                  className="w-full bg-elegant-card border border-elegant-border focus:border-elegant-gold/40 rounded-lg px-3 py-1.5 text-xs outline-none transition-colors"
                  placeholder="Match key"
                />
              </div>

              <button
                onClick={handleRegister}
                className="w-full py-2 bg-elegant-gold hover:bg-elegant-gold-dark font-bold text-xs text-black rounded-lg mt-2 transition-colors cursor-pointer"
              >
                Register Credentials
              </button>

              <button
                onClick={() => {
                  setScreen("LOGIN");
                  setErrorText("");
                }}
                className="w-full text-center text-elegant-gold hover:text-elegant-gold-light text-[10px] py-1 cursor-pointer"
              >
                Already have a handle? Login Node
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 4: DASHBOARD HUB */}
        {screen === "DASHBOARD" && currentUser && (
          <div className="flex-1 flex flex-col h-full bg-elegant-bg">
            {/* Header banner */}
            <div className="bg-elegant-card border-b border-elegant-border p-5 shrink-0 flex justify-between items-center text-white">
              <div>
                <h4 className="font-serif font-bold text-lg text-elegant-gold leading-none">{currentUser.name}</h4>
                <span className="text-[10px] text-elegant-gold-light/80 font-mono font-semibold tracking-wider block mt-1">SECURE DESKTOP CLIENT</span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-1.5 bg-elegant-card-alt hover:bg-elegant-card-hover border border-elegant-border rounded-lg transition-colors cursor-pointer"
                title="Disconnect from Socket"
              >
                <LogOut className="w-4 h-4 text-elegant-gold" />
              </button>
            </div>

            {/* Hub Cards */}
            <div className="flex-1 p-6 overflow-y-auto grid grid-cols-2 gap-4">
              <button 
                onClick={() => setScreen("CHAT")}
                className="bg-elegant-card border border-elegant-border hover:border-elegant-gold/40 p-4 rounded-xl text-left flex flex-col gap-2 transition-all cursor-pointer group gold-glow-hover"
              >
                <div className="p-2 bg-elegant-gold-muted hover:bg-elegant-gold-muted/80 text-elegant-gold rounded-lg self-start transition-colors">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-serif font-bold text-sm text-gray-100">Socket Messenger</h5>
                  <p className="text-[10px] text-elegant-muted mt-1">Join global chat feeds or start direct one-to-one streams</p>
                </div>
              </button>

              <button 
                onClick={() => setScreen("GROUP_CREATE")}
                className="bg-elegant-card border border-elegant-border hover:border-elegant-gold/40 p-4 rounded-xl text-left flex flex-col gap-2 transition-all cursor-pointer group gold-glow-hover"
              >
                <div className="p-2 bg-elegant-gold-muted hover:bg-elegant-gold-muted/80 text-elegant-gold rounded-lg self-start transition-colors">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-serif font-bold text-sm text-gray-100">Group Hub</h5>
                  <p className="text-[10px] text-elegant-muted mt-1">Spin up distinct group rooms with custom memberships</p>
                </div>
              </button>

              <button 
                onClick={() => setScreen("PROFILE")}
                className="bg-elegant-card border border-elegant-border hover:border-elegant-gold/40 p-4 rounded-xl text-left flex flex-col gap-2 transition-all cursor-pointer group gold-glow-hover"
              >
                <div className="p-2 bg-elegant-gold-muted hover:bg-elegant-gold-muted/80 text-elegant-gold rounded-lg self-start transition-colors">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-serif font-bold text-sm text-gray-100">Identity settings</h5>
                  <p className="text-[10px] text-elegant-muted mt-1">Configure email and character displays on database</p>
                </div>
              </button>

              <button 
                onClick={handleLogout}
                className="bg-elegant-card border border-elegant-border hover:border-red-500/40 p-4 rounded-xl text-left flex flex-col gap-2 transition-all cursor-pointer group animate-pulse-slow"
              >
                <div className="p-2 bg-red-500/10 group-hover:bg-red-500/20 text-red-400 rounded-lg self-start transition-colors">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-serif font-bold text-sm text-gray-100">Terminate Thread</h5>
                  <p className="text-[10px] text-elegant-muted mt-1">Release Connection pool resources and sign-out</p>
                </div>
              </button>
            </div>

            {/* Footer with telemetry details */}
            <div className="bg-elegant-card-alt p-2 border-t border-elegant-border flex justify-between text-[9px] font-mono text-elegant-muted">
              <span>Local Loop: {ipAddress}</span>
              <span>RDBMS Pool connected</span>
            </div>
          </div>
        )}

        {/* SCREEN 5: MESSENGER SCREEN */}
        {screen === "CHAT" && currentUser && (
          <div className="flex-1 flex h-full overflow-hidden">
            
            {/* Sidebar list */}
            <div className="w-48 bg-elegant-card-alt border-r border-elegant-border/50 flex flex-col shrink-0">
              <div className="p-2 border-b border-elegant-border/50">
                <button 
                  onClick={() => setScreen("DASHBOARD")}
                  className="w-full text-center py-1 bg-elegant-card hover:bg-elegant-card-hover text-[10px] font-bold text-elegant-gold border border-elegant-border rounded transition-colors cursor-pointer"
                >
                  ← Return Dashboard
                </button>
              </div>

              {/* Chat listings */}
              <div className="flex-1 overflow-y-auto p-1.5 space-y-1.5 scrollbar-thin">
                <button
                  onClick={() => setSelectedChat("BROADCAST")}
                  className={`w-full text-left px-2 py-1.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                    selectedChat === "BROADCAST" 
                      ? "bg-elegant-gold-muted border border-elegant-border-hover text-elegant-gold" 
                      : "text-elegant-muted hover:bg-elegant-card-hover"
                  }`}
                >
                  🌐 Broadcast Channel
                </button>

                {/* Users List */}
                <div className="pt-2">
                  <span className="text-[9px] font-bold text-elegant-gold uppercase tracking-widest pl-2">Users List</span>
                  <div className="space-y-1 mt-1">
                    {dbData.users.filter(u => u.user_id !== currentUser.user_id).map((u) => {
                      const isSel = typeof selectedChat === "object" && selectedChat.type === "USER" && selectedChat.id === u.user_id;
                      return (
                        <button
                          key={u.user_id}
                          onClick={() => setSelectedChat({ type: "USER", id: u.user_id })}
                          className={`w-full text-left px-2 py-1.5 rounded text-[11px] flex justify-between items-center transition-all cursor-pointer ${
                            isSel 
                              ? "bg-elegant-gold-muted border border-elegant-border-hover text-elegant-gold font-semibold" 
                              : "text-elegant-muted hover:bg-elegant-card-hover"
                          }`}
                        >
                          <span className="truncate">{u.username}</span>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.status === "ONLINE" ? "bg-elegant-gold animate-pulse" : "bg-gray-600"}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Groups List */}
                <div className="pt-2">
                  <span className="text-[9px] font-bold text-elegant-gold uppercase tracking-widest pl-2">Groups List</span>
                  <div className="space-y-1 mt-1">
                    {dbData.groups.map((g) => {
                      const isSel = typeof selectedChat === "object" && selectedChat.type === "GROUP" && selectedChat.id === g.group_id;
                      return (
                        <button
                          key={g.group_id}
                          onClick={() => setSelectedChat({ type: "GROUP", id: g.group_id })}
                          className={`w-full text-left px-2 py-1.5 rounded text-[11px] truncate transition-all cursor-pointer ${
                            isSel 
                              ? "bg-elegant-gold-muted border border-elegant-border-hover text-elegant-gold font-semibold" 
                              : "text-elegant-muted hover:bg-elegant-card-hover"
                          }`}
                        >
                          # {g.group_name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 flex flex-col h-full bg-elegant-bg overflow-hidden relative">
              {/* Chat screen header */}
              <div className="bg-elegant-card-alt px-4 py-2.5 border-b border-elegant-border/50 flex justify-between items-center shrink-0">
                <div>
                  <h5 className="font-serif font-bold text-[12px] text-gray-200">
                    {selectedChat === "BROADCAST" ? "🌐 Global Broadcast Chat" : selectedChat.type === "GROUP" ? `# ${dbData.groups.find(g => g.group_id === selectedChat.id)?.group_name}` : `👤 ${dbData.users.find(u => u.user_id === selectedChat.id)?.name}`}
                  </h5>
                  {/* Typing indicators */}
                  {activeTypingUsernames.length > 0 && (
                    <span className="text-[9px] text-elegant-gold italic font-mono block">
                      {activeTypingUsernames.join(", ")} is writing stream...
                    </span>
                  )}
                </div>
              </div>

              {/* Messages viewport list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin select-text">
                {getFilteredMessages().length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-elegant-muted italic text-xs">
                    No stream message history recorded. Start typing.
                  </div>
                ) : (
                  getFilteredMessages().map((msg) => {
                    const isOwn = msg.sender_id === currentUser.user_id;
                    const senderObj = dbData.users.find((u) => u.user_id === msg.sender_id);
                    return (
                      <div key={msg.message_id} className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-bold text-elegant-gold font-mono">
                            {senderObj ? senderObj.username : "Guest"}
                          </span>
                          <span className="text-[8px] text-elegant-muted">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className={`p-2.5 rounded-xl text-[11px] leading-relaxed max-w-[180px] break-words ${
                          isOwn 
                            ? "bg-elegant-gold text-black font-semibold rounded-tr-none shadow shadow-elegant-gold/10" 
                            : "bg-elegant-card text-gray-200 rounded-tl-none border border-elegant-border"
                        }`}>
                          {msg.message_type === "IMAGE" && msg.file_path ? (
                            <div className="space-y-1.5">
                              <img src={msg.file_path} alt="Shared" className="rounded-lg max-w-full h-auto object-cover max-h-32 select-none" referrerPolicy="no-referrer" />
                              <p className="text-[10px] underline hover:text-elegant-gold-light font-medium break-all block">{msg.message}</p>
                            </div>
                          ) : msg.message_type === "DOCUMENT" && msg.file_path ? (
                            <div className="space-y-1 bg-elegant-bg/40 p-2 rounded-lg border border-elegant-border">
                              <span className="text-[10px] font-mono text-elegant-gold-light block truncate">📄 File download available</span>
                              <a href={msg.file_path} download className="text-[10px] text-elegant-gold font-bold hover:underline truncate block">
                                {msg.message}
                              </a>
                            </div>
                          ) : (
                            <span>{msg.message}</span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat input controls bar */}
              <div className="bg-elegant-card-alt p-2 border-t border-elegant-border/50 shrink-0 flex gap-2 items-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
                <button 
                  onClick={handleAttachmentClick}
                  className="p-1.5 bg-elegant-card hover:bg-elegant-card-hover border border-elegant-border rounded text-elegant-gold transition-colors cursor-pointer"
                  title="Upload Shared Asset"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                </button>
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => {
                    setMessageText(e.target.value);
                    sendTypingStatus(e.target.value.length > 0);
                  }}
                  onBlur={() => sendTypingStatus(false)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendMessage();
                  }}
                  className="flex-1 bg-elegant-card border border-elegant-border focus:border-elegant-gold/40 rounded-lg px-3 py-1.5 text-[11px] outline-none transition-colors text-white"
                  placeholder="Type secure network message..."
                />
                <button 
                  onClick={handleSendMessage}
                  className="p-1.5 bg-elegant-gold hover:bg-elegant-gold-dark rounded text-black font-bold text-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 6: GROUP CREATE SCREEN */}
        {screen === "GROUP_CREATE" && currentUser && (
          <div className="flex-1 flex flex-col p-6 max-w-sm mx-auto w-full">
            <div className="mb-4 text-center">
              <h3 className="text-xl font-serif font-bold text-elegant-gold">Spawn Chatroom Group</h3>
              <p className="text-[10px] text-elegant-muted">Initialize transactional group records</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-semibold text-elegant-muted block mb-1">Group Name</label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full bg-elegant-card border border-elegant-border focus:border-elegant-gold/40 rounded-lg px-3 py-1.5 text-xs outline-none transition-all"
                  placeholder="e.g. Code Architects"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-elegant-muted block mb-1">Select Group Members</label>
                <div className="bg-elegant-card-alt border border-elegant-border rounded-lg p-2.5 max-h-32 overflow-y-auto space-y-1.5 scrollbar-thin">
                  {dbData.users.filter(u => u.user_id !== currentUser.user_id).map((u) => {
                    const isChecked = selectedGroupMembers.includes(u.user_id);
                    return (
                      <label key={u.user_id} className="flex items-center gap-2 text-xs text-gray-300 hover:text-white cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          className="accent-elegant-gold"
                          onChange={() => {
                            if (isChecked) {
                              setSelectedGroupMembers(prev => prev.filter(id => id !== u.user_id));
                            } else {
                              setSelectedGroupMembers(prev => [...prev, u.user_id]);
                            }
                          }}
                        />
                        <span>{u.name} ({u.username})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setScreen("DASHBOARD")}
                  className="flex-1 py-1.5 bg-elegant-card-alt border border-elegant-border hover:bg-elegant-card-hover text-xs font-semibold rounded-lg transition-colors text-gray-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateGroup}
                  className="flex-1 py-1.5 bg-elegant-gold hover:bg-elegant-gold-dark text-xs font-bold text-black rounded-lg transition-all cursor-pointer"
                >
                  Spawn Room
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 7: PROFILE SETTINGS */}
        {screen === "PROFILE" && currentUser && (
          <div className="flex-1 flex flex-col p-6 max-w-sm mx-auto w-full">
            <div className="mb-4 text-center">
              <h3 className="text-xl font-serif font-bold text-elegant-gold">Configure Identity Profile</h3>
              <p className="text-[10px] text-elegant-muted">Update contact values inside MySQL DB</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-semibold text-elegant-muted block mb-1">Display Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full bg-elegant-card border border-elegant-border focus:border-elegant-gold/40 rounded-lg px-3 py-1.5 text-xs outline-none text-white"
                  placeholder="Display Name"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-elegant-muted block mb-1">Email Contact Address</label>
                <input
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full bg-elegant-card border border-elegant-border focus:border-elegant-gold/40 rounded-lg px-3 py-1.5 text-xs outline-none text-white"
                  placeholder="user@example.com"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setScreen("DASHBOARD")}
                  className="flex-1 py-1.5 bg-elegant-card-alt border border-elegant-border hover:bg-elegant-card-hover text-xs font-semibold rounded-lg text-gray-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateProfile}
                  className="flex-1 py-1.5 bg-elegant-gold hover:bg-elegant-gold-dark text-xs font-bold text-black rounded-lg cursor-pointer"
                >
                  Save settings
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

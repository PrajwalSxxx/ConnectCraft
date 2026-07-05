export interface User {
  user_id: number;
  name: string;
  username: string;
  email: string;
  profile_picture: string;
  status: "ONLINE" | "OFFLINE";
  last_seen: string;
  created_at: string;
}

export interface Message {
  message_id: number;
  sender_id: number;
  receiver_id: number | null;
  group_id: number | null;
  message: string;
  message_type: "TEXT" | "IMAGE" | "DOCUMENT";
  file_path: string | null;
  timestamp: string;
}

export interface Group {
  group_id: number;
  group_name: string;
  created_by: number;
  created_at: string;
}

export interface GroupMember {
  group_id: number;
  user_id: number;
}

export interface ChatLog {
  log_id: number;
  user_id: number;
  activity: string;
  timestamp: string;
}

export interface Database {
  users: User[];
  messages: Message[];
  groups: Group[];
  group_members: GroupMember[];
  chat_logs: ChatLog[];
}

export interface JavaServerLog {
  timestamp: string;
  level: "INFO" | "WARNING" | "SEVERE";
  message: string;
}

export interface SimulatedThread {
  threadId: string;
  userId: number | null;
  username: string | null;
  ip: string;
  connectedAt: string;
}

export interface JavaFile {
  path: string;
  name: string;
  content: string;
}

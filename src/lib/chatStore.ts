import { create } from 'zustand';

export interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  role: string;
  department: string;
  isOnline: boolean;
  statusText?: string;
  bio?: string;
}

export interface ChatMessage {
  id: string;
  roomId: string; // channel id like 'general' or dm id like 'dm_user123'
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderRole?: string;
  senderDept?: string;
  content: string;
  timestamp: string;
  reactions?: Record<string, string[]>; // emoji -> userIds
  isPrivate?: boolean;
  codeSnippet?: {
    language: string;
    code: string;
  };
  attachments?: {
    type: 'image' | 'file' | 'link';
    url: string;
    name: string;
  }[];
}

export interface ChatRoom {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'general' | 'academic' | 'tech' | 'social';
  unreadCount?: number;
}

export const CAMPUS_STUDENTS: ChatUser[] = [
  {
    id: 'user_alex',
    name: 'Alex Rivera',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'Student Representative',
    department: 'Computer Science',
    isOnline: true,
    statusText: 'Prepping for Midterm Algorithms Exam 📚',
    bio: '3rd Year CS Student & Hackathon Lead.',
  },
  {
    id: 'user_sophia',
    name: 'Sophia Chen',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    role: 'AI Researcher',
    department: 'Data Science & AI',
    isOnline: true,
    statusText: 'Debugging PyTorch models 🧠',
    bio: 'AI Club Co-founder & Machine Learning enthusiast.',
  },
  {
    id: 'user_marcus',
    name: 'Marcus Vance',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'Hostel Representative',
    department: 'Electrical Engineering',
    isOnline: true,
    statusText: 'In Campus Library Study Room 4B 📍',
    bio: '4th Year EE student. Love robotics & embedded systems.',
  },
  {
    id: 'user_elena',
    name: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    role: 'Governance Jury Lead',
    department: 'Law & Public Policy',
    isOnline: false,
    statusText: 'Reviewing campus council proposals 🏛️',
    bio: 'Student Council VP & Jury Administrator.',
  },
  {
    id: 'user_david',
    name: 'David Kim',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    role: 'Peer Tutor',
    department: 'Mathematics & Stats',
    isOnline: true,
    statusText: 'Free linear algebra tutoring available!',
    bio: 'Math tutor & competitive programming enthusiast.',
  },
  {
    id: 'user_priya',
    name: 'Priya Patel',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    role: 'Events Director',
    department: 'Business & Economics',
    isOnline: true,
    statusText: 'Organizing Hackathon 2026 🚀',
    bio: 'Student Guild Executive & Tech Startup founder.',
  },
];

export const DEFAULT_CHAT_ROOMS: ChatRoom[] = [
  {
    id: 'general-campus',
    name: 'General Campus Chatroom',
    description: 'The main open chatroom for all students across departments',
    icon: '💬',
    category: 'general',
  },
  {
    id: 'study-and-exams',
    name: 'Study Lounge & Exam Prep',
    description: 'Collaborate on assignments, past papers, and group study',
    icon: '📚',
    category: 'academic',
  },
  {
    id: 'tech-and-ai',
    name: 'Tech, Code & AI Hub',
    description: 'Share code snippets, AI prompts, hackathons, and projects',
    icon: '💻',
    category: 'tech',
  },
  {
    id: 'campus-events-chat',
    name: 'Events & Social Lounge',
    description: 'Talk about weekend meetups, hostel tournaments, and parties',
    icon: '🎉',
    category: 'social',
  },
];

const INITIAL_PUBLIC_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_1',
    roomId: 'general-campus',
    senderId: 'user_alex',
    senderName: 'Alex Rivera',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    senderRole: 'Student Rep',
    senderDept: 'Computer Science',
    content: 'Welcome everyone to the General Campus Chatroom! Feel free to ask questions or isolate anyone for a private 1-on-1 study chat. 👋',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    reactions: { '👋': ['user_sophia', 'user_marcus'], '🔥': ['user_david'] },
  },
  {
    id: 'msg_2',
    roomId: 'general-campus',
    senderId: 'user_sophia',
    senderName: 'Sophia Chen',
    senderAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    senderRole: 'AI Researcher',
    senderDept: 'Data Science',
    content: 'Is anyone in the library right now? Looking for a study partner for tomorrow\'s Machine Learning review session!',
    timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    reactions: { '📚': ['user_marcus'] },
  },
  {
    id: 'msg_3',
    roomId: 'general-campus',
    senderId: 'user_marcus',
    senderName: 'Marcus Vance',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    senderRole: 'Hostel Rep',
    senderDept: 'Electrical Engineering',
    content: 'I\'m currently in Study Room 4B on the 3rd floor! We have extra seats and whiteboards available if anyone wants to join. 📍',
    timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
    reactions: { '🙌': ['user_alex', 'user_sophia'] },
  },
  {
    id: 'msg_4',
    roomId: 'general-campus',
    senderId: 'user_david',
    senderName: 'David Kim',
    senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    senderRole: 'Peer Tutor',
    senderDept: 'Mathematics',
    content: 'I uploaded the Linear Algebra formula sheets to the Resources page! Click on any student profile if you want to launch an isolated 1-on-1 message session with them.',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    reactions: { '💡': ['user_priya'] },
  },
];

const INITIAL_DM_MESSAGES: Record<string, ChatMessage[]> = {
  user_alex: [
    {
      id: 'dm_alex_1',
      roomId: 'dm_user_alex',
      senderId: 'user_alex',
      senderName: 'Alex Rivera',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      content: 'Hey there! Thanks for opening a 1-on-1 private chat with me. Let me know if you need any assistance with Computer Science courses or campus events!',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      isPrivate: true,
    },
  ],
  user_sophia: [
    {
      id: 'dm_sophia_1',
      roomId: 'dm_user_sophia',
      senderId: 'user_sophia',
      senderName: 'Sophia Chen',
      senderAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      content: 'Hi! Happy to connect 1-on-1. Are you interested in AI models, research papers, or hackathon collaboration?',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      isPrivate: true,
    },
  ],
};

// Helper functions for persistent storage
const STORAGE_KEY_PUBLIC = 'center7_public_chat_messages';
const STORAGE_KEY_DM = 'center7_dm_chat_messages';

export function loadStoredPublicMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PUBLIC);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading public chat messages:', e);
  }
  return INITIAL_PUBLIC_MESSAGES;
}

export function saveStoredPublicMessages(messages: ChatMessage[]) {
  try {
    localStorage.setItem(STORAGE_KEY_PUBLIC, JSON.stringify(messages));
  } catch (e) {
    console.error('Error saving public chat messages:', e);
  }
}

export function loadStoredDmMessages(): Record<string, ChatMessage[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DM);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading DM messages:', e);
  }
  return INITIAL_DM_MESSAGES;
}

export function saveStoredDmMessages(dms: Record<string, ChatMessage[]>) {
  try {
    localStorage.setItem(STORAGE_KEY_DM, JSON.stringify(dms));
  } catch (e) {
    console.error('Error saving DM messages:', e);
  }
}

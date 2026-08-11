export interface BillboardAnnouncement {
  id: string;
  communityId: string;
  title: string;
  content: string;
  category: 'announcement' | 'urgent' | 'event' | 'rules' | 'resource';
  isPinned: boolean;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorRole: 'Group Admin' | 'Elder' | 'Creator';
  createdAt: string;
  updatedAt?: string;
  acknowledgedCount?: number;
  reactions?: Record<string, number>;
}

export interface GroupMember {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  role: 'admin' | 'member';
  joinedAt: string;
  isOnline?: boolean;
}

export interface JoinRequest {
  id: string;
  communityId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userEmail?: string;
  status: 'pending' | 'approved' | 'declined';
  requestedAt: string;
}

export interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  avatarUrl?: string;
  visibility: 'public' | 'private';
  createdAt: string;
  memberCount: number;
  adminName?: string;
  admins: string[]; // user IDs of admins
  pinnedBillboardId?: string;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
  userRole?: 'admin' | 'member';
  content: string;
  createdAt: string;
  isSystem?: boolean;
  systemType?: 'billboard_pin' | 'member_joined' | 'group_updated';
  isPinned?: boolean;
  reactions?: Record<string, string[]>; // emoji -> array of userIds
  replyTo?: {
    id: string;
    userName: string;
    content: string;
  };
  attachments?: {
    type: 'image' | 'file' | 'link';
    url: string;
    name: string;
  }[];
}

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  category: 'academic' | 'social' | 'tech' | 'sports' | 'workshop' | 'governance' | 'career';
  date: string;
  time: string;
  location: string;
  isOnline?: boolean;
  onlineUrl?: string;
  organizer: string;
  organizerAvatar?: string;
  imageUrl?: string;
  attendeesCount: number;
  capacity?: number;
  userRsvp?: 'going' | 'interested' | null;
  tags: string[];
  createdAt: string;
}


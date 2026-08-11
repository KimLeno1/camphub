import { CommunityGroup, JoinRequest, GroupMember } from '../types';

const COMMUNITIES_STORAGE_KEY = 'center7_communities_list';
const MEMBERSHIPS_STORAGE_KEY = 'center7_user_memberships';
const JOIN_REQUESTS_STORAGE_KEY = 'center7_join_requests';

const INITIAL_COMMUNITIES: CommunityGroup[] = [
  {
    id: 'cs-26',
    name: "Computer Science Class of '26",
    description: "Official WhatsApp group for CS students. Group Admins post midterm schedules and lab announcements to the Billboard.",
    visibility: 'public',
    createdAt: new Date(Date.now() - 3600000 * 24 * 30).toISOString(),
    memberCount: 42,
    adminName: 'Nana Adu Asare',
    admins: ['admin-1', 'lenoakowan@gmail.com'],
  },
  {
    id: 'campus-tech',
    name: "Campus Tech Innovators & Devs",
    description: "Private collaborative project group for campus hackers, open source builders, and hackathon competitors.",
    visibility: 'private',
    createdAt: new Date(Date.now() - 3600000 * 24 * 15).toISOString(),
    memberCount: 88,
    adminName: 'KIM_LENO Admin',
    admins: ['admin-2'],
  },
  {
    id: 'hostel-4',
    name: "Hostel 4 Student Assembly",
    description: "Resident group for Hostel 4 safety updates, maintenance logs, and student governance polls.",
    visibility: 'public',
    createdAt: new Date(Date.now() - 3600000 * 24 * 60).toISOString(),
    memberCount: 65,
    adminName: 'Nana Adu Asare',
    admins: ['admin-1'],
  }
];

// Default sample join requests for demo display
const INITIAL_JOIN_REQUESTS: JoinRequest[] = [
  {
    id: 'req-1',
    communityId: 'campus-tech',
    userId: 'user-101',
    userName: 'Emmanuel Mensah',
    userEmail: 'emmanuel@cs.edu',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    status: 'pending',
    requestedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'req-2',
    communityId: 'campus-tech',
    userId: 'user-102',
    userName: 'Grace Addo',
    userEmail: 'grace.a@student.edu',
    status: 'pending',
    requestedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  }
];

// Storage getters
export function getStoredCommunities(): CommunityGroup[] {
  try {
    const raw = localStorage.getItem(COMMUNITIES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(COMMUNITIES_STORAGE_KEY, JSON.stringify(INITIAL_COMMUNITIES));
      return INITIAL_COMMUNITIES;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_COMMUNITIES;
  }
}

export function saveStoredCommunities(list: CommunityGroup[]) {
  try {
    localStorage.setItem(COMMUNITIES_STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('center7_community_update'));
  } catch (e) {
    console.error('Failed to save communities', e);
  }
}

export function getStoredMemberships(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(MEMBERSHIPS_STORAGE_KEY);
    if (!raw) {
      // Default memberships for current user
      const initial = { 'me': ['cs-26'], 'lenoakowan@gmail.com': ['cs-26', 'campus-tech'] };
      localStorage.setItem(MEMBERSHIPS_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    return { 'me': ['cs-26'] };
  }
}

export function isUserMember(userIdOrEmail: string, communityId: string): boolean {
  const memberships = getStoredMemberships();
  const userGroups = memberships[userIdOrEmail] || memberships['me'] || [];
  return userGroups.includes(communityId);
}

export function addMemberToCommunity(userIdOrEmail: string, communityId: string) {
  const memberships = getStoredMemberships();
  const current = memberships[userIdOrEmail] || [];
  if (!current.includes(communityId)) {
    memberships[userIdOrEmail] = [...current, communityId];
    if (userIdOrEmail !== 'me') {
      memberships['me'] = Array.from(new Set([...(memberships['me'] || []), communityId]));
    }
    localStorage.setItem(MEMBERSHIPS_STORAGE_KEY, JSON.stringify(memberships));
    
    // Increment member count in community
    const communities = getStoredCommunities();
    const updated = communities.map(c => {
      if (c.id === communityId) {
        return { ...c, memberCount: c.memberCount + 1 };
      }
      return c;
    });
    saveStoredCommunities(updated);
  }
}

// Join Requests Management
export function getStoredJoinRequests(): JoinRequest[] {
  try {
    const raw = localStorage.getItem(JOIN_REQUESTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(JOIN_REQUESTS_STORAGE_KEY, JSON.stringify(INITIAL_JOIN_REQUESTS));
      return INITIAL_JOIN_REQUESTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_JOIN_REQUESTS;
  }
}

export function saveStoredJoinRequests(requests: JoinRequest[]) {
  try {
    localStorage.setItem(JOIN_REQUESTS_STORAGE_KEY, JSON.stringify(requests));
    window.dispatchEvent(new Event('center7_community_update'));
  } catch (e) {
    console.error('Failed to save join requests', e);
  }
}

export function getJoinRequestsForCommunity(communityId: string): JoinRequest[] {
  const all = getStoredJoinRequests();
  return all.filter(r => r.communityId === communityId && r.status === 'pending');
}

export function getUserPendingRequest(communityId: string, userIdOrEmail: string): JoinRequest | undefined {
  const all = getStoredJoinRequests();
  return all.find(r => r.communityId === communityId && r.status === 'pending' && (r.userId === userIdOrEmail || r.userEmail === userIdOrEmail));
}

export function createJoinRequest(communityId: string, user: { id: string; name: string; email?: string; avatar?: string }): JoinRequest {
  const all = getStoredJoinRequests();
  
  // Check if request already exists
  const existing = all.find(r => r.communityId === communityId && (r.userId === user.id || r.userEmail === user.email));
  if (existing) {
    if (existing.status === 'pending') return existing;
    // Reset status if re-requesting
    existing.status = 'pending';
    existing.requestedAt = new Date().toISOString();
    saveStoredJoinRequests(all);
    return existing;
  }

  const newReq: JoinRequest = {
    id: `req-${Date.now()}`,
    communityId,
    userId: user.id || 'me',
    userName: user.name || 'Student Member',
    userEmail: user.email,
    userAvatar: user.avatar,
    status: 'pending',
    requestedAt: new Date().toISOString(),
  };

  saveStoredJoinRequests([newReq, ...all]);
  return newReq;
}

export function cancelJoinRequest(requestId: string) {
  const all = getStoredJoinRequests();
  const updated = all.filter(r => r.id !== requestId);
  saveStoredJoinRequests(updated);
}

export function processJoinRequest(requestId: string, action: 'approved' | 'declined') {
  const all = getStoredJoinRequests();
  const target = all.find(r => r.id === requestId);
  if (!target) return;

  target.status = action;
  saveStoredJoinRequests(all);

  if (action === 'approved') {
    addMemberToCommunity(target.userId, target.communityId);
    if (target.userEmail) {
      addMemberToCommunity(target.userEmail, target.communityId);
    }
  }
}

// Group Visibility Toggle by Admin
export function updateCommunityVisibility(communityId: string, visibility: 'public' | 'private') {
  const communities = getStoredCommunities();
  const updated = communities.map(c => {
    if (c.id === communityId) {
      return { ...c, visibility };
    }
    return c;
  });
  saveStoredCommunities(updated);
}

export function createNewCommunity(group: { name: string; description: string; visibility: 'public' | 'private'; adminEmail: string }): CommunityGroup {
  const current = getStoredCommunities();
  const newComm: CommunityGroup = {
    id: `group-${Date.now()}`,
    name: group.name,
    description: group.description,
    visibility: group.visibility,
    createdAt: new Date().toISOString(),
    memberCount: 1,
    adminName: 'You (Group Admin)',
    admins: [group.adminEmail || 'lenoakowan@gmail.com', 'me'],
  };

  saveStoredCommunities([newComm, ...current]);
  addMemberToCommunity('me', newComm.id);
  if (group.adminEmail) addMemberToCommunity(group.adminEmail, newComm.id);

  return newComm;
}

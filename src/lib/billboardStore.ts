import { BillboardAnnouncement } from '../types';

const STORAGE_KEY = 'center7_community_billboards';

const INITIAL_BILLBOARDS: Record<string, BillboardAnnouncement[]> = {
  // Fallback initial billboards for any community
  default: [
    {
      id: 'bb-1',
      communityId: 'default',
      title: '🚨 Midterm Examination Schedule & Venue Allocations',
      content: 'Please review the official timetable posted by the Department Admin. All CS301 exams will take place in Science Hall Lab B. Bring your physical Student ID card.',
      category: 'urgent',
      isPinned: true,
      authorId: 'admin-1',
      authorName: 'Nana Adu Asare',
      authorAvatar: '/sss.jpeg',
      authorRole: 'Group Admin',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      acknowledgedCount: 24,
      reactions: { '👍': 18, '📌': 12, '🙌': 8 }
    },
    {
      id: 'bb-2',
      communityId: 'default',
      title: '📢 Group Rules & Code of Conduct',
      content: '1. Keep discussions respectful and academic.\n2. Use the Resource section for sharing verified study materials.\n3. Respect community voting results on peer moderation.',
      category: 'rules',
      isPinned: false,
      authorId: 'admin-1',
      authorName: 'Nana Adu Asare',
      authorAvatar: '/sss.jpeg',
      authorRole: 'Group Admin',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      acknowledgedCount: 42,
      reactions: { '✅': 35 }
    },
    {
      id: 'bb-3',
      communityId: 'default',
      title: '📅 Hackathon & Group Study Hack Session',
      content: 'Join us this Friday at 4:00 PM GMT in the Student Lounge for our collaborative coding sprint and peer algorithm review session.',
      category: 'event',
      isPinned: false,
      authorId: 'admin-2',
      authorName: 'KIM_LENO Admin',
      authorRole: 'Group Admin',
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      acknowledgedCount: 19,
      reactions: { '🚀': 15, '🔥': 10 }
    }
  ]
};

export function getStoredBillboards(communityId: string): BillboardAnnouncement[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return INITIAL_BILLBOARDS[communityId] || INITIAL_BILLBOARDS.default;
    }
    const parsed = JSON.parse(raw);
    if (parsed[communityId] && parsed[communityId].length > 0) {
      return parsed[communityId];
    }
    return INITIAL_BILLBOARDS[communityId] || INITIAL_BILLBOARDS.default;
  } catch (e) {
    return INITIAL_BILLBOARDS[communityId] || INITIAL_BILLBOARDS.default;
  }
}

export function saveStoredBillboards(communityId: string, items: BillboardAnnouncement[]) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    parsed[communityId] = items;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    window.dispatchEvent(new Event('center7_billboard_update'));
  } catch (e) {
    console.error('Failed to save billboards', e);
  }
}

export function addBillboardItem(communityId: string, item: Omit<BillboardAnnouncement, 'id' | 'createdAt'>): BillboardAnnouncement {
  const current = getStoredBillboards(communityId);
  
  // If new item is set to pinned, unpin others or make it the primary pinned item
  let updated = current;
  if (item.isPinned) {
    updated = current.map(b => ({ ...b, isPinned: false }));
  }

  const newItem: BillboardAnnouncement = {
    ...item,
    id: `bb-${Date.now()}`,
    createdAt: new Date().toISOString(),
    acknowledgedCount: 1,
    reactions: { '📌': 1 }
  };

  const nextList = [newItem, ...updated];
  saveStoredBillboards(communityId, nextList);
  return newItem;
}

export function togglePinBillboardItem(communityId: string, itemId: string): BillboardAnnouncement[] {
  const current = getStoredBillboards(communityId);
  const target = current.find(b => b.id === itemId);
  if (!target) return current;

  const nextIsPinned = !target.isPinned;

  const updated = current.map(b => {
    if (b.id === itemId) {
      return { ...b, isPinned: nextIsPinned };
    }
    // Only one pinned item at a time for top banner clarity
    if (nextIsPinned) {
      return { ...b, isPinned: false };
    }
    return b;
  });

  saveStoredBillboards(communityId, updated);
  return updated;
}

export function deleteBillboardItem(communityId: string, itemId: string): BillboardAnnouncement[] {
  const current = getStoredBillboards(communityId);
  const updated = current.filter(b => b.id !== itemId);
  saveStoredBillboards(communityId, updated);
  return updated;
}

export function acknowledgeBillboardItem(communityId: string, itemId: string): BillboardAnnouncement[] {
  const current = getStoredBillboards(communityId);
  const updated = current.map(b => {
    if (b.id === itemId) {
      return { ...b, acknowledgedCount: (b.acknowledgedCount || 0) + 1 };
    }
    return b;
  });
  saveStoredBillboards(communityId, updated);
  return updated;
}

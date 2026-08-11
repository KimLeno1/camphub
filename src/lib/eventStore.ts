import { CampusEvent } from '../types';

const EVENTS_STORAGE_KEY = 'center7_campus_events';
const RSVPS_STORAGE_KEY = 'center7_user_rsvps';

const INITIAL_EVENTS: CampusEvent[] = [
  {
    id: 'evt-1',
    title: 'Decentralized AI & Web3 Hackathon 2026',
    description: 'Join top student developers, AI researchers, and builders for a 24-hour hackathon. Great prizes, free food, and mentorship from industry alumni.',
    category: 'tech',
    date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    time: '10:00 AM',
    location: 'Innovation Hub, Main Campus',
    isOnline: false,
    organizer: 'Campus Tech Innovators',
    organizerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80',
    attendeesCount: 84,
    capacity: 120,
    userRsvp: 'going',
    tags: ['Hackathon', 'AI', 'Coding', 'Prizes'],
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: 'evt-2',
    title: 'CS Class of 26: Data Structures & Algorithms Revision',
    description: 'Collaborative peer-study prep session focusing on trees, graph traversals, and dynamic programming ahead of next week midterm exams.',
    category: 'academic',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '04:00 PM',
    location: 'Central Library Study Room 3B',
    isOnline: false,
    organizer: "CS '26 Class Execs",
    organizerAvatar: '/sss.jpeg',
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
    attendeesCount: 35,
    capacity: 50,
    userRsvp: 'going',
    tags: ['Study Group', 'Midterms', 'CS'],
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'evt-3',
    title: 'Campus Tech Talk: Building Fullstack Apps with Gemini',
    description: 'Live interactive workshop on prompt engineering, Gemini API integrations, and building AI studio applets with React and Node.',
    category: 'workshop',
    date: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
    time: '02:00 PM',
    location: 'Google Meet Virtual Auditorium',
    isOnline: true,
    onlineUrl: 'https://meet.google.com/abc-defg-hij',
    organizer: 'Google Student Developer Club',
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80',
    attendeesCount: 142,
    capacity: 250,
    tags: ['Gemini', 'Workshop', 'Virtual', 'AI'],
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'evt-4',
    title: 'Hostel 4 Inter-Floor Football Tournament Finals',
    description: 'The annual Hostel 4 football showdown! Cheer for your floor, enjoy music, BBQ, and trophies.',
    category: 'sports',
    date: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    time: '03:30 PM',
    location: 'University Sports Complex Pitch 2',
    isOnline: false,
    organizer: 'Hostel 4 Sports Committee',
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80',
    attendeesCount: 210,
    tags: ['Sports', 'Football', 'Hostel 4', 'Fun'],
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
  },
  {
    id: 'evt-5',
    title: 'Student Assembly Open Governance Townhall',
    description: 'Direct Q&A with Student Representative Council leaders regarding campus security upgrades, hostel renovations, and academic calendar updates.',
    category: 'governance',
    date: new Date(Date.now() + 86400000 * 6).toISOString().split('T')[0],
    time: '05:00 PM',
    location: 'Main Amphitheatre',
    isOnline: false,
    organizer: 'SRC Governance Board',
    imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&auto=format&fit=crop&q=80',
    attendeesCount: 95,
    tags: ['Governance', 'Townhall', 'SRC', 'Campus Policy'],
    createdAt: new Date(Date.now() - 3600000 * 96).toISOString(),
  }
];

export function getStoredEvents(): CampusEvent[] {
  try {
    const raw = localStorage.getItem(EVENTS_STORAGE_KEY);
    const rsvps = getStoredRsvps();
    
    let events: CampusEvent[];
    if (!raw) {
      events = INITIAL_EVENTS;
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(INITIAL_EVENTS));
    } else {
      events = JSON.parse(raw);
    }

    // Attach current user RSVP state
    return events.map(evt => ({
      ...evt,
      userRsvp: rsvps[evt.id] || evt.userRsvp || null,
    }));
  } catch (e) {
    return INITIAL_EVENTS;
  }
}

export function saveStoredEvents(events: CampusEvent[]) {
  try {
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
    window.dispatchEvent(new Event('center7_events_update'));
  } catch (e) {
    console.error('Failed to save events', e);
  }
}

export function getStoredRsvps(): Record<string, 'going' | 'interested' | null> {
  try {
    const raw = localStorage.getItem(RSVPS_STORAGE_KEY);
    if (!raw) {
      const initial = { 'evt-1': 'going' as const, 'evt-2': 'going' as const };
      localStorage.setItem(RSVPS_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

export function toggleEventRsvp(eventId: string, newStatus: 'going' | 'interested') {
  const rsvps = getStoredRsvps();
  const current = rsvps[eventId];
  const events = getStoredEvents();

  let targetRsvp: 'going' | 'interested' | null = newStatus;
  
  // If clicking same status, toggle off
  if (current === newStatus) {
    targetRsvp = null;
    delete rsvps[eventId];
  } else {
    rsvps[eventId] = newStatus;
  }

  localStorage.setItem(RSVPS_STORAGE_KEY, JSON.stringify(rsvps));

  // Update attendees count
  const updatedEvents = events.map(evt => {
    if (evt.id === eventId) {
      let diff = 0;
      if (current !== 'going' && targetRsvp === 'going') diff = 1;
      else if (current === 'going' && targetRsvp !== 'going') diff = -1;

      return {
        ...evt,
        attendeesCount: Math.max(0, evt.attendeesCount + diff),
        userRsvp: targetRsvp,
      };
    }
    return evt;
  });

  saveStoredEvents(updatedEvents);
}

export function createCampusEvent(eventInput: {
  title: string;
  description: string;
  category: 'academic' | 'social' | 'tech' | 'sports' | 'workshop' | 'governance' | 'career';
  date: string;
  time: string;
  location: string;
  isOnline?: boolean;
  onlineUrl?: string;
  organizer: string;
  capacity?: number;
  imageUrl?: string;
  tags?: string[];
}): CampusEvent {
  const currentEvents = getStoredEvents();

  const newEvt: CampusEvent = {
    id: `evt-${Date.now()}`,
    title: eventInput.title,
    description: eventInput.description,
    category: eventInput.category,
    date: eventInput.date,
    time: eventInput.time,
    location: eventInput.location,
    isOnline: !!eventInput.isOnline,
    onlineUrl: eventInput.onlineUrl,
    organizer: eventInput.organizer || 'Student Organizer',
    organizerAvatar: '/sss.jpeg',
    imageUrl: eventInput.imageUrl || 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80',
    attendeesCount: 1, // Author is automatically going
    capacity: eventInput.capacity || 100,
    userRsvp: 'going',
    tags: eventInput.tags || [eventInput.category.toUpperCase(), 'Campus Event'],
    createdAt: new Date().toISOString(),
  };

  saveStoredEvents([newEvt, ...currentEvents]);
  toggleEventRsvp(newEvt.id, 'going');

  return newEvt;
}

export function deleteCampusEvent(eventId: string) {
  const current = getStoredEvents();
  const updated = current.filter(e => e.id !== eventId);
  saveStoredEvents(updated);
}

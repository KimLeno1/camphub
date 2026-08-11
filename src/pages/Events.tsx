import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Calendar, Clock, MapPin, Users, Plus, Search, Tag, Globe, CheckCircle2, Star, Share2, Sparkles, Filter, ExternalLink, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { getStoredEvents, toggleEventRsvp, deleteCampusEvent } from '../lib/eventStore';
import { CampusEvent } from '../types';
import { CreateEventModal } from '../components/events/CreateEventModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';

const CATEGORY_CHIPS = [
  { id: 'all', label: 'All Events' },
  { id: 'my-rsvps', label: '⭐ My RSVPs' },
  { id: 'tech', label: '💻 Tech & Hackathons' },
  { id: 'academic', label: '📚 Academic Study' },
  { id: 'workshop', label: '🎓 Workshops' },
  { id: 'sports', label: '⚽ Sports' },
  { id: 'social', label: '🎉 Social' },
  { id: 'governance', label: '🏛️ Governance' },
];

export function Events() {
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CampusEvent | null>(null);

  const reloadEvents = () => {
    setEvents(getStoredEvents());
  };

  useEffect(() => {
    reloadEvents();
    const handleUpdate = () => reloadEvents();
    window.addEventListener('center7_events_update', handleUpdate);
    return () => window.removeEventListener('center7_events_update', handleUpdate);
  }, []);

  const handleRsvp = (eventId: string, status: 'going' | 'interested') => {
    toggleEventRsvp(eventId, status);
    reloadEvents();
    toast.success(`RSVP updated: ${status === 'going' ? 'Going to event!' : 'Marked as Interested'}`);
  };

  const handleDelete = (eventId: string, title: string) => {
    deleteCampusEvent(eventId);
    reloadEvents();
    toast.info(`Event "${title}" deleted.`);
    if (selectedEvent?.id === eventId) setSelectedEvent(null);
  };

  const handleShare = (event: CampusEvent) => {
    const text = `📅 ${event.title}\n📍 ${event.location}\n🕒 ${event.date} at ${event.time}\nOrganized by: ${event.organizer}`;
    navigator.clipboard.writeText(text);
    toast.success('Event details copied to clipboard!');
  };

  const filteredEvents = events.filter((evt) => {
    const matchesSearch = 
      evt.title.toLowerCase().includes(search.toLowerCase()) ||
      evt.description.toLowerCase().includes(search.toLowerCase()) ||
      evt.location.toLowerCase().includes(search.toLowerCase()) ||
      evt.organizer.toLowerCase().includes(search.toLowerCase()) ||
      evt.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));

    if (selectedCategory === 'my-rsvps') {
      return matchesSearch && !!evt.userRsvp;
    }
    if (selectedCategory !== 'all') {
      return matchesSearch && evt.category === selectedCategory;
    }
    return matchesSearch;
  });

  const goingCount = events.filter(e => e.userRsvp === 'going').length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-safe px-4 sm:px-6">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground flex items-center gap-2">
                <span>Campus Events & Calendar</span>
                <Badge className="bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px] font-bold">
                  {events.length} Upcoming Events
                </Badge>
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Discover study groups, tech hackathons, sports tournaments, and student governance townhalls.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          {goingCount > 0 && (
            <Badge className="bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 text-xs py-1.5 px-3 font-bold gap-1.5 hidden sm:flex">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>You're attending {goingCount} event{goingCount > 1 ? 's' : ''}</span>
            </Badge>
          )}

          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 px-5 rounded-xl shadow-md shadow-blue-600/20 gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add New Event
          </Button>
        </div>
      </div>



      {/* Search & Category Toolbar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              className="pl-10 h-11 text-xs sm:text-sm rounded-xl bg-card border-border focus-visible:ring-blue-600" 
              placeholder="Search events by title, organizer, topic, location..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <p className="text-xs text-muted-foreground font-medium self-end sm:self-center">
            Showing <strong className="text-foreground">{filteredEvents.length}</strong> event{filteredEvents.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {CATEGORY_CHIPS.map((chip) => (
            <button
              key={chip.id}
              onClick={() => setSelectedCategory(chip.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                selectedCategory === chip.id
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-card border-border text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl bg-card space-y-3">
          <Calendar className="w-12 h-12 text-muted-foreground/40 mx-auto" />
          <h3 className="text-base font-bold text-foreground">No events found matching criteria</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Try clearing filters or be the first to publish an event for your study group or hostel.
          </p>
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9 px-4 rounded-xl gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add Event Now
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map((event) => (
            <Card 
              key={event.id}
              className="bg-card border-border hover:border-blue-500/50 transition-all shadow-xs hover:shadow-md rounded-2xl flex flex-col overflow-hidden group"
            >
              {/* Event Image Banner */}
              <div className="relative h-44 w-full bg-muted overflow-hidden">
                <img 
                  src={event.imageUrl || 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80'} 
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Category Badge Top Left */}
                <Badge className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white font-bold text-[10px] uppercase tracking-wider border border-white/20">
                  {event.category}
                </Badge>

                {/* RSVP Badge Top Right */}
                {event.userRsvp === 'going' && (
                  <Badge className="absolute top-3 right-3 bg-emerald-600 text-white font-bold text-[10px] py-0.5 px-2 gap-1 shadow-md">
                    <CheckCircle2 className="w-3 h-3" /> Attending
                  </Badge>
                )}
                {event.userRsvp === 'interested' && (
                  <Badge className="absolute top-3 right-3 bg-amber-500 text-white font-bold text-[10px] py-0.5 px-2 gap-1 shadow-md">
                    <Star className="w-3 h-3 fill-white" /> Interested
                  </Badge>
                )}

                {/* Date Badge Overlay Bottom Left */}
                <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-background/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-border/60 text-xs font-bold text-foreground shadow-sm">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}</span>
                  <span className="text-muted-foreground">• {event.time}</span>
                </div>
              </div>

              {/* Card Body */}
              <CardContent className="p-4 space-y-3 flex-1">
                {/* Title */}
                <div>
                  <h3 
                    onClick={() => setSelectedEvent(event)}
                    className="font-heading font-bold text-base text-foreground line-clamp-2 hover:text-blue-600 cursor-pointer transition-colors"
                  >
                    {event.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                    {event.description}
                  </p>
                </div>

                {/* Location & Venue */}
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2 text-foreground font-semibold">
                    {event.isOnline ? (
                      <Globe className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    ) : (
                      <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    )}
                    <span className="truncate">{event.location}</span>
                  </div>

                  {event.isOnline && event.onlineUrl && (
                    <a 
                      href={event.onlineUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[11px] text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1 pl-5.5"
                    >
                      <span>Join Virtual Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {/* Attendees & Capacity */}
                <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                    <Users className="w-3.5 h-3.5 text-blue-500" />
                    <span><strong className="text-foreground font-bold">{event.attendeesCount}</strong> attending</span>
                  </div>

                  <span className="text-[11px] text-muted-foreground">
                    Organized by: <strong className="text-foreground">{event.organizer}</strong>
                  </span>
                </div>

                {/* Tags */}
                {event.tags && event.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {event.tags.map((tag, idx) => (
                      <span key={idx} className="text-[10px] bg-muted px-2 py-0.5 rounded-md font-semibold text-muted-foreground">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>

              {/* Card Footer RSVP Controls */}
              <CardFooter className="p-4 pt-0 gap-2 border-t border-border/20 mt-auto">
                <Button
                  size="sm"
                  variant={event.userRsvp === 'going' ? 'default' : 'outline'}
                  onClick={() => handleRsvp(event.id, 'going')}
                  className={`flex-1 font-bold text-xs h-9 rounded-xl gap-1.5 ${
                    event.userRsvp === 'going' 
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs' 
                      : 'hover:bg-emerald-500/10 hover:text-emerald-600 border-border'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{event.userRsvp === 'going' ? 'Going' : 'Attend'}</span>
                </Button>

                <Button
                  size="sm"
                  variant={event.userRsvp === 'interested' ? 'secondary' : 'outline'}
                  onClick={() => handleRsvp(event.id, 'interested')}
                  className={`font-bold text-xs h-9 rounded-xl gap-1 ${
                    event.userRsvp === 'interested'
                      ? 'bg-amber-500/20 text-amber-900 dark:text-amber-200 border-amber-500/40'
                      : 'text-muted-foreground'
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${event.userRsvp === 'interested' ? 'fill-amber-500 text-amber-500' : ''}`} />
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleShare(event)}
                  className="h-9 w-9 p-0 rounded-xl text-muted-foreground hover:text-foreground"
                  title="Share Event"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onEventCreated={reloadEvents}
      />

      {/* Event Details Dialog */}
      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={(open) => { if (!open) setSelectedEvent(null); }}>
          <DialogContent className="max-w-lg p-0 overflow-hidden rounded-2xl border-border">
            <div className="relative h-48 w-full bg-muted">
              <img src={selectedEvent.imageUrl} alt={selectedEvent.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <Badge className="bg-blue-600 text-white font-bold text-[10px] mb-1 uppercase">
                  {selectedEvent.category}
                </Badge>
                <h2 className="text-lg font-bold font-heading line-clamp-1">{selectedEvent.title}</h2>
              </div>
            </div>

            <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                {selectedEvent.description}
              </p>

              <div className="space-y-2 bg-muted/30 p-3.5 rounded-xl border border-border/60 text-xs">
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span>Date: {new Date(selectedEvent.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>Time: {selectedEvent.time}</span>
                </div>
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  <span>Venue: {selectedEvent.location}</span>
                </div>
                {selectedEvent.isOnline && selectedEvent.onlineUrl && (
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold">
                    <Globe className="w-4 h-4" />
                    <a href={selectedEvent.onlineUrl} target="_blank" rel="noreferrer" className="underline">
                      {selectedEvent.onlineUrl}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4 text-purple-500" />
                  <span>Organized by {selectedEvent.organizer} • {selectedEvent.attendeesCount} Attending</span>
                </div>
              </div>
            </div>

            <DialogFooter className="p-4 border-t border-border bg-card flex justify-between items-center">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(selectedEvent.id, selectedEvent.title)}
                className="text-xs rounded-xl gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </Button>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedEvent(null)} className="rounded-xl text-xs">
                  Close
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => {
                    handleRsvp(selectedEvent.id, 'going');
                    setSelectedEvent(null);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Attend Event
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

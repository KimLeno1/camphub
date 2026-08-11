import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Calendar, Clock, MapPin, Globe, Image as ImageIcon, Users, Sparkles, Tag, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { createCampusEvent } from '../../lib/eventStore';
import { useAuthStore } from '../../store/authStore';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: () => void;
}

const CATEGORY_OPTIONS = [
  { id: 'academic', label: 'Academic & Study', icon: '📚' },
  { id: 'tech', label: 'Tech & Hackathons', icon: '💻' },
  { id: 'workshop', label: 'Workshops & Seminars', icon: '🎓' },
  { id: 'sports', label: 'Sports & Fitness', icon: '⚽' },
  { id: 'social', label: 'Social & Parties', icon: '🎉' },
  { id: 'governance', label: 'Governance & Townhalls', icon: '🏛️' },
  { id: 'career', label: 'Career & Networking', icon: '💼' },
];

const DEFAULT_IMAGE_PRESETS = [
  { label: 'Tech & Hackathon', url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80' },
  { label: 'Study & Library', url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80' },
  { label: 'Workshop & Auditorium', url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80' },
  { label: 'Sports & Pitch', url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80' },
  { label: 'Party & Festival', url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80' },
];

export function CreateEventModal({ isOpen, onClose, onEventCreated }: CreateEventModalProps) {
  const { user } = useAuthStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'academic' | 'social' | 'tech' | 'sports' | 'workshop' | 'governance' | 'career'>('tech');
  const [date, setDate] = useState(new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]);
  const [time, setTime] = useState('14:00');
  const [location, setLocation] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const [onlineUrl, setOnlineUrl] = useState('');
  const [capacity, setCapacity] = useState('100');
  const [organizer, setOrganizer] = useState(user?.displayName || 'Student Organizer');
  const [imageUrl, setImageUrl] = useState(DEFAULT_IMAGE_PRESETS[0].url);
  const [tagsInput, setTagsInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please enter an event title');
      return;
    }
    if (!description.trim()) {
      toast.error('Please enter an event description');
      return;
    }
    if (!location.trim() && !isOnline) {
      toast.error('Please specify a venue location or toggle online event');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    createCampusEvent({
      title: title.trim(),
      description: description.trim(),
      category,
      date,
      time,
      location: isOnline ? (location.trim() || 'Virtual Event') : location.trim(),
      isOnline,
      onlineUrl: isOnline ? onlineUrl.trim() : undefined,
      organizer: organizer.trim() || 'Student Organizer',
      capacity: parseInt(capacity) || 100,
      imageUrl: imageUrl.trim(),
      tags: tags.length > 0 ? tags : [category.toUpperCase(), 'Campus Event'],
    });

    toast.success('🎉 Event successfully published to Campus Calendar!');
    onEventCreated();
    onClose();

    // Reset Form
    setTitle('');
    setDescription('');
    setLocation('');
    setIsOnline(false);
    setOnlineUrl('');
    setTagsInput('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-2xl border-border max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-600/15 via-blue-600/5 to-background border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                <span>Create Campus Event</span>
                <Badge className="bg-blue-600 text-white font-bold text-[10px] py-0 px-2">
                  Public Calendar
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Organize hackathons, study meetups, sports, or workshops for students.
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Event Title */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground">Event Title *</Label>
            <Input
              placeholder="e.g. CS 2026 Algorithms & Data Structures Exam Prep"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10 text-xs rounded-xl"
              required
            />
          </div>

          {/* Category Picker */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground">Event Category *</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORY_OPTIONS.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.id as any)}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2 text-xs font-semibold transition-all ${
                    category === cat.id
                      ? 'bg-blue-600/10 border-blue-600 text-blue-600 dark:text-blue-400 font-bold ring-2 ring-blue-500/20'
                      : 'bg-card border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <span className="text-base">{cat.icon}</span>
                  <span className="truncate">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground">Event Description *</Label>
            <Textarea
              placeholder="Describe what attendees should expect, agenda, prerequisites, or topics..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-xs rounded-xl min-h-[80px]"
              required
            />
          </div>

          {/* Date and Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                <span>Date *</span>
              </Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-10 text-xs rounded-xl"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                <span>Time *</span>
              </Label>
              <Input
                type="text"
                placeholder="e.g. 02:30 PM or 14:00"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="h-10 text-xs rounded-xl"
                required
              />
            </div>
          </div>

          {/* Location / Venue & Online Toggle */}
          <div className="space-y-2 p-3.5 bg-muted/30 rounded-xl border border-border/60">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                <span>Venue & Mode</span>
              </Label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isOnline}
                  onChange={(e) => setIsOnline(e.target.checked)}
                  className="rounded border-border text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-blue-500" /> Virtual / Online Event
                </span>
              </label>
            </div>

            {!isOnline ? (
              <Input
                placeholder="e.g. Central Library Study Room 3B or Innovation Hub"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-10 text-xs rounded-xl"
                required={!isOnline}
              />
            ) : (
              <div className="space-y-2 pt-1">
                <Input
                  placeholder="e.g. Google Meet / Zoom Auditorium"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-9 text-xs rounded-xl"
                />
                <Input
                  placeholder="https://meet.google.com/abc-defg-hij (Meeting Link)"
                  value={onlineUrl}
                  onChange={(e) => setOnlineUrl(e.target.value)}
                  className="h-9 text-xs rounded-xl"
                />
              </div>
            )}
          </div>

          {/* Organizer & Capacity Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">Organizer Name</Label>
              <Input
                placeholder="e.g. Campus Tech Society"
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                className="h-10 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-500" />
                <span>Max Capacity</span>
              </Label>
              <Input
                type="number"
                placeholder="100"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="h-10 text-xs rounded-xl"
              />
            </div>
          </div>

          {/* Image Presets & Custom URL */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-purple-500" />
              <span>Event Banner Image</span>
            </Label>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {DEFAULT_IMAGE_PRESETS.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setImageUrl(preset.url)}
                  className={`relative w-20 h-12 rounded-lg overflow-hidden border shrink-0 transition-all ${
                    imageUrl === preset.url ? 'ring-2 ring-blue-500 border-blue-500 scale-105' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-white font-bold truncate px-1 py-0.5 text-center">
                    {preset.label.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
            <Input
              placeholder="Or enter custom image URL..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="h-9 text-xs rounded-xl mt-1"
            />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-amber-500" />
              <span>Tags (comma-separated)</span>
            </Label>
            <Input
              placeholder="e.g. Midterms, Study, Computer Science, Hackathon"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="h-10 text-xs rounded-xl"
            />
          </div>

          {/* Dialog Footer */}
          <DialogFooter className="pt-3 border-t border-border flex justify-end gap-2 shrink-0">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs px-5 shadow-sm"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Publish Event
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

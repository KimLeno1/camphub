import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Calendar, Clock, MapPin, Users, Radio } from 'lucide-react';
import { socketService } from '../lib/api/socket';

export function Events() {
  const [attendees, setAttendees] = useState(128);

  useEffect(() => {
    // Simulate live attendee updates
    const interval = setInterval(() => {
      setAttendees(prev => prev + (Math.random() > 0.5 ? 1 : -1));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-safe">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Events</h1>
          <p className="text-muted-foreground mt-1">Discover study groups, seminars, and meetups.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 pointer-events-none" />
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex items-center text-red-500 font-semibold mb-2">
                <Radio className="w-4 h-4 mr-2 animate-pulse" />
                LIVE NOW
              </div>
              <div className="bg-background/80 backdrop-blur text-xs font-medium px-2 py-1 rounded-md flex items-center border border-border">
                <Users className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
                {attendees} watching
              </div>
            </div>
            <CardTitle className="text-xl">Decentralized AI Governance Townhall</CardTitle>
            <CardDescription>Join the core contributors in discussing the next protocol upgrade.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-black rounded-lg flex flex-col items-center justify-center relative overflow-hidden group/video cursor-pointer">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1591115765373-5207764f72e7?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center opacity-40 mix-blend-luminosity"></div>
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 z-10 transition-transform group-hover/video:scale-110">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-red-600 hover:bg-red-700 text-white border-red-600">Join Livestream</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

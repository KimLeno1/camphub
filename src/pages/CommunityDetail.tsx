import React from 'react';
import { useParams, useNavigate, Routes, Route } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api/client';
import { Button } from '../components/ui/button';
import { Loader2 } from 'lucide-react';
import { WhatsAppChatView } from '../components/community/WhatsAppChatView';

export function CommunityDetail() {
  const { communityId } = useParams();
  const navigate = useNavigate();

  const { data: community, isLoading, isError } = useQuery({
    queryKey: ['community', communityId],
    queryFn: async () => {
      try {
        const res = await apiClient.get(`/communities`);
        const commList = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
        const found = commList.find((c: any) => c.id === communityId);
        if (found) return found;
      } catch (e) {
        // Fallback demo community
      }

      return {
        id: communityId || 'cs-26',
        name: communityId === 'campus-tech' 
          ? 'Campus Tech Innovators & Devs' 
          : communityId === 'hostel-4'
          ? 'Hostel 4 Student Assembly'
          : "Computer Science Class of '26",
        description: "Official WhatsApp group for CS students. Group Admins post midterm schedules and lab announcements to the Billboard.",
        memberCount: 42,
        adminName: 'Nana Adu Asare',
      };
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#075e54]" />
      </div>
    );
  }

  if (isError || !community) {
    return (
      <div className="flex flex-col h-full items-center justify-center space-y-4 p-12 text-center">
        <p className="text-destructive font-medium">WhatsApp Group not found.</p>
        <Button variant="outline" onClick={() => navigate('/communities')}>Back to Groups</Button>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8.5rem)] md:h-[calc(100vh-6.5rem)] -m-4 md:-m-6 lg:-m-8 rounded-xl overflow-hidden border border-border shadow-sm">
      <WhatsAppChatView 
        community={community} 
        channelId={communityId || 'main'} 
        onBack={() => navigate('/communities')}
      />
    </div>
  );
}

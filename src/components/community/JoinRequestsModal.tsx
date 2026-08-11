import React from 'react';
import { JoinRequest } from '../../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { UserCheck, UserX, Clock, ShieldAlert, Check, X, ShieldCheck, Mail } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface JoinRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupName: string;
  requests: JoinRequest[];
  onProcessRequest: (requestId: string, action: 'approved' | 'declined') => void;
}

export function JoinRequestsModal({
  isOpen,
  onClose,
  groupName,
  requests,
  onProcessRequest,
}: JoinRequestsModalProps) {
  const pendingRequests = requests.filter(r => r.status === 'pending');

  const handleAction = (request: JoinRequest, action: 'approved' | 'declined') => {
    onProcessRequest(request.id, action);
    if (action === 'approved') {
      toast.success(`Approved ${request.userName}'s join request!`);
    } else {
      toast.info(`Declined ${request.userName}'s request.`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl border-border">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-600/15 via-emerald-600/5 to-background border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <span>Join Requests</span>
                <Badge className="bg-amber-500 text-white font-bold text-[10px] py-0 px-2">
                  {pendingRequests.length} Pending
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Private Group Admin Moderation • {groupName}
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto bg-muted/10">
          {pendingRequests.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <UserCheck className="w-8 h-8 text-muted-foreground/40 mx-auto" />
              <p className="text-xs font-semibold text-muted-foreground">No pending join requests at the moment.</p>
              <p className="text-[11px] text-muted-foreground/80">New requests to join this private group will appear here for Admin review.</p>
            </div>
          ) : (
            pendingRequests.map((req) => (
              <div 
                key={req.id} 
                className="bg-card p-3.5 rounded-xl border border-border shadow-2xs space-y-3 hover:border-emerald-500/40 transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="w-10 h-10 border border-border shrink-0">
                      <AvatarImage src={req.userAvatar} />
                      <AvatarFallback className="bg-emerald-600 text-white font-bold text-xs">
                        {req.userName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-foreground truncate">{req.userName}</h4>
                      {req.userEmail && (
                        <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                          <Mail className="w-3 h-3 inline" />
                          <span>{req.userEmail}</span>
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground/80 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-500 inline" />
                        <span>Requested {formatDistanceToNow(new Date(req.requestedAt), { addSuffix: true })}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1 border-t border-border/50">
                  <Button
                    size="sm"
                    onClick={() => handleAction(req, 'approved')}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 rounded-lg gap-1.5 shadow-2xs"
                  >
                    <Check className="w-4 h-4" />
                    Allow Entry
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAction(req, 'declined')}
                    className="flex-1 text-red-600 dark:text-red-400 hover:bg-red-500/10 border-red-500/30 font-bold text-xs h-8 rounded-lg gap-1.5"
                  >
                    <X className="w-4 h-4" />
                    Decline
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="p-3 border-t border-border bg-card flex justify-between items-center text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Admin Control Panel</span>
          </span>
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs rounded-xl">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

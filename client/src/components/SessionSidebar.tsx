import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Plus } from 'lucide-react';
import { ChatSessionData } from '@shared/schema';
import { formatDistanceToNow } from 'date-fns';

interface SessionSidebarProps {
  sessions: ChatSessionData[];
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  isCreatingSession: boolean;
}

export function SessionSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  isCreatingSession,
}: SessionSidebarProps) {
  return (
    <div className="w-64 border-r bg-card/30 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <Button
          onClick={onNewSession}
          disabled={isCreatingSession}
          className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          data-testid="button-new-chat"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
      </div>

      {/* Sessions List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {sessions.length === 0 ? (
            <div className="text-center py-8 px-4 text-muted-foreground text-sm">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No chat sessions yet</p>
              <p className="text-xs mt-1">Click "New Chat" to start</p>
            </div>
          ) : (
            sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={`w-full text-left p-3 rounded-lg transition-all duration-200 group ${
                  activeSessionId === session.id
                    ? 'bg-primary/10 border border-primary/20'
                    : 'hover-elevate'
                }`}
                data-testid={`button-session-${session.id}`}
              >
                <div className="flex items-start gap-2">
                  <MessageSquare className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                    activeSessionId === session.id ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm truncate ${
                      activeSessionId === session.id ? 'text-primary' : 'text-foreground'
                    }`}>
                      {session.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {session.messageCount || 0} messages
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

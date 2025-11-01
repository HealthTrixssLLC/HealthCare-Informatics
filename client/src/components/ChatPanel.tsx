import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, RefreshCw, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from '@shared/schema';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  useCache: boolean;
  onUseCacheChange: (value: boolean) => void;
}

export function ChatPanel({ messages, onSendMessage, isLoading, useCache, onUseCacheChange }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-screen w-96 border-r bg-gradient-to-b from-sidebar/50 to-sidebar backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b bg-card/50 backdrop-blur-sm">
        <div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Chat Interface</h2>
          <p className="text-xs text-muted-foreground mt-1">Describe your report requirements</p>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4 py-6" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 py-12 animate-in fade-in duration-500">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 shadow-lg">
                <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Start a Conversation</h3>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                Ask for any healthcare report. I'll fetch data from the FHIR server and create visualizations for you.
              </p>
            </div>
          )}
          
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          
          {isLoading && (
            <div className="flex items-start gap-3 mr-auto max-w-[80%] animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="rounded-2xl rounded-tl-sm bg-gradient-to-br from-accent to-accent/50 px-5 py-3 shadow-md border border-accent-foreground/10">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span className="text-sm font-medium text-accent-foreground">Analyzing FHIR data...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="px-4 py-4 border-t bg-card space-y-3">
        {/* Quick Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              const message = "Show me a summary of recent patient observations";
              onSendMessage(message);
            }}
            disabled={isLoading}
            className="flex-1 text-left px-3 py-2 rounded-lg bg-gradient-to-br from-accent/30 to-accent/10 border border-accent-foreground/10 hover-elevate active-elevate-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            data-testid="button-suggestion-1"
          >
            <span className="font-semibold text-accent-foreground">Patient Observations</span>
          </button>
          <button
            onClick={() => {
              const message = "Generate a report on patient conditions by status";
              onSendMessage(message);
            }}
            disabled={isLoading}
            className="flex-1 text-left px-3 py-2 rounded-lg bg-gradient-to-br from-accent/30 to-accent/10 border border-accent-foreground/10 hover-elevate active-elevate-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            data-testid="button-suggestion-2"
          >
            <span className="font-semibold text-accent-foreground">Conditions Analysis</span>
          </button>
        </div>

        {/* Data Source Toggle */}
        <div className="flex items-center justify-between gap-4 px-3 py-2 rounded-md bg-accent/10 border border-accent/20">
          <div className="flex items-center gap-2">
            {useCache ? (
              <Database className="w-4 h-4 text-muted-foreground" />
            ) : (
              <RefreshCw className="w-4 h-4 text-primary" />
            )}
            <Label htmlFor="use-cache" className="text-sm font-medium cursor-pointer">
              {useCache ? 'Use Cached Data' : 'Refresh from Server'}
            </Label>
          </div>
          <Switch
            id="use-cache"
            checked={useCache}
            onCheckedChange={onUseCacheChange}
            disabled={isLoading}
            data-testid="switch-use-cache"
          />
        </div>

        <form onSubmit={handleSubmit} className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Describe the report you want to generate..."
            className="w-full min-h-12 max-h-32 resize-none rounded-lg bg-input px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={isLoading}
            data-testid="input-chat-message"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 bottom-2 rounded-full"
            data-testid="button-send-message"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  
  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-${isUser ? 'right' : 'left'}-4 duration-300`}
      data-testid={`message-${message.role}-${message.id}`}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-5 py-3 shadow-md ${
          isUser
            ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-tr-sm ml-auto border border-primary/20'
            : 'bg-gradient-to-br from-accent to-accent/50 text-accent-foreground rounded-tl-sm mr-auto border border-accent-foreground/10'
        }`}
      >
        <p className="text-base whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
        <p className="text-xs opacity-70 mt-2.5">
          {new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </p>
      </div>
    </div>
  );
}

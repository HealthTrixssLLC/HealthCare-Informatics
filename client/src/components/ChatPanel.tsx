import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from '@shared/schema';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export function ChatPanel({ messages, onSendMessage, isLoading }: ChatPanelProps) {
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
    <div className="flex flex-col h-screen w-96 border-r bg-card">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div>
          <h2 className="text-xl font-semibold">Chat Interface</h2>
          <p className="text-xs text-muted-foreground mt-1">Describe your report requirements</p>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4 py-6" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 py-12">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold mb-2">Start a Conversation</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Ask for any healthcare report. I'll fetch data from the FHIR server and create visualizations for you.
              </p>
              <div className="mt-6 space-y-2 w-full">
                <button
                  onClick={() => {
                    const message = "Show me a summary of recent patient observations";
                    onSendMessage(message);
                  }}
                  disabled={isLoading}
                  className="w-full text-left px-4 py-3 rounded-lg bg-accent/50 hover-elevate active-elevate-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="button-suggestion-1"
                >
                  <span className="font-medium">Patient Observations</span>
                  <p className="text-xs text-muted-foreground mt-1">Recent vital signs and measurements</p>
                </button>
                <button
                  onClick={() => {
                    const message = "Generate a report on patient conditions by status";
                    onSendMessage(message);
                  }}
                  disabled={isLoading}
                  className="w-full text-left px-4 py-3 rounded-lg bg-accent/50 hover-elevate active-elevate-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="button-suggestion-2"
                >
                  <span className="font-medium">Conditions Analysis</span>
                  <p className="text-xs text-muted-foreground mt-1">Patient conditions breakdown</p>
                </button>
              </div>
            </div>
          )}
          
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          
          {isLoading && (
            <div className="flex items-start gap-3 mr-auto max-w-[80%]">
              <div className="rounded-2xl rounded-tl-sm bg-accent px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Analyzing FHIR data...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="px-4 py-4 border-t bg-card">
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
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
      data-testid={`message-${message.role}-${message.id}`}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-primary text-primary-foreground rounded-tr-sm ml-auto'
            : 'bg-accent text-accent-foreground rounded-tl-sm mr-auto'
        }`}
      >
        <p className="text-base whitespace-pre-wrap break-words">{message.content}</p>
        <p className="text-xs opacity-70 mt-2">
          {new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </p>
      </div>
    </div>
  );
}

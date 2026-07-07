import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '../store';
import { apiClient } from '../api/client';
import { AvatarBubble, ChatBubble, DisclosureNote, RiskTag } from '../components/DesignSystem';
import { useToast } from '../components/Toast';
import { t } from '../data/i18n';
import { Send, Mic, ChevronDown, ChevronUp, ShieldCheck, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ArthAIScreen() {
  const lang = useAppStore(state => state.language);
  const user = useAppStore(state => state.user);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const prompts = [
    { key: 'prompt.investSurplus', text: 'How should I invest my surplus?' },
    { key: 'prompt.taxSaving', text: 'Help me save tax under 80C' },
    { key: 'prompt.retirement', text: 'Am I on track for retirement?' },
    { key: 'prompt.human', text: 'Talk to human advisor' },
  ];

  // Fetch threads and their messages
  const { data: threads = [] } = useQuery({
    queryKey: ['advisoryThreads'],
    queryFn: async () => {
      const res = await apiClient.get('/advisory/threads');
      return res.data;
    },
    staleTime: 60 * 1000, // 1 minute — chat data updates frequently
    placeholderData: []
  });

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await apiClient.get('/profile/settings');
      return res.data;
    },
    staleTime: 5 * 60 * 1000
  });
  
  const showAssumptions = settings?.show_planning_assumptions ?? true;

  const sendMessageMutation = useMutation({
    mutationFn: async (text: string) => {
      const res = await apiClient.post('/advisory/message', { text, threadId: currentThreadId });
      return res.data;
    },
    onSuccess: (data) => {
      setSpeaking(false);
      setCurrentThreadId(data.threadId);
      queryClient.invalidateQueries({ queryKey: ['advisoryThreads'] });
    },
    onError: () => {
      setSpeaking(false);
      toast('Failed to send message. Please try again.', 'error');
    }
  });

  const activeThread = threads.find((t: any) => t.id === currentThreadId) || threads[0];
  const messages = activeThread?.messages || [];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, speaking]);

  const sendMessage = (text: string) => {
    setSpeaking(true);
    sendMessageMutation.mutate(text);
    setInput('');
  };

  // No full-screen loader — threads has placeholderData so UI renders instantly

  const handleHumanConnect = () => {
    sendMessage(t('btn.connectHuman', lang));
  };

  return (
    <div className="screen-enter flex flex-col h-full bg-[#F4F6F9]">
      {/* Avatar Header */}
      <div className="flex flex-col items-center py-3 px-4 bg-white border-b border-gray-200 shadow-xs relative">
        <div className="absolute right-3 top-3">
          <button 
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`p-1.5 rounded-full text-xs transition-colors cursor-pointer ${audioEnabled ? 'bg-[#003366]/10 text-[#003366]' : 'bg-gray-100 text-gray-400'}`}
            title="Toggle Voice Mode"
          >
            {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>

        <AvatarBubble size="large" speaking={speaking} />
        <div className="flex items-center gap-1.5 mt-2">
          <ShieldCheck size={14} className="text-emerald-600" />
          <p className="text-[11px] font-bold text-gray-700">{t('arthai.compliance', lang)}</p>
        </div>
        <button 
          onClick={handleHumanConnect}
          className="text-[11px] text-[#003366] font-bold mt-0.5 underline cursor-pointer hover:text-[#FF6B00] transition-colors"
        >
          {t('arthai.humanLink', lang)}
        </button>
      </div>

      {/* Chat messages stream */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto phone-scroll px-3 py-3 space-y-2">
        {messages.length === 0 && !speaking && (
          <div className="text-center py-10 px-4">
            <div className="w-12 h-12 rounded-2xl bg-[#003366]/10 text-[#003366] flex items-center justify-center mx-auto mb-3">
              <Sparkles size={24} />
            </div>
            <h3 className="text-sm font-bold text-gray-800">Hello {user?.name?.split(' ')[0] || ''}!</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-[260px] mx-auto leading-relaxed">
              Ask me anything about your cash flows, tax saving under Sec 80C, or investment strategies.
            </p>
          </div>
        )}

        {messages.map((msg: any) => (
          <div key={msg.id} className="space-y-1">
            <ChatBubble sender={msg.sender}>
              <span className="whitespace-pre-line">{msg.text}</span>
            </ChatBubble>

            {/* Why this rationale drawer toggle */}
            {msg.sender === 'arthai' && msg.rationale && showAssumptions && (
              <div className="ml-2 mb-3">
                <button 
                  onClick={() => setExpandedId(expandedId === msg.id ? null : msg.id)}
                  className="flex items-center gap-1 text-[11px] font-bold text-gray-500 hover:text-[#003366] transition-colors cursor-pointer"
                >
                  <span>{t('plan.whyThis', lang)}</span>
                  {expandedId === msg.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>
                {expandedId === msg.id && (
                  <div className="chat-enter mt-1.5 p-3 bg-white rounded-xl border border-gray-200 shadow-sm text-[11px] text-gray-700 space-y-2">
                    <p className="leading-relaxed"><strong className="text-gray-900">Deterministic Rationale:</strong> {msg.rationale}</p>
                    {msg.suitabilityNote && (
                      <p className="text-[10px] font-bold text-emerald-700 bg-emerald-50 p-1.5 rounded border border-emerald-200">
                        ✓ {msg.suitabilityNote}
                      </p>
                    )}
                    {msg.disclosure && <DisclosureNote text={msg.disclosure} />}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        
        {speaking && (
           <div className="space-y-1">
            <ChatBubble sender="arthai">
               <span className="text-gray-400">Typing...</span>
            </ChatBubble>
           </div>
        )}
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-3 py-2 flex gap-2 overflow-x-auto bg-white border-t border-gray-200 shrink-0">
        {prompts.map(p => (
          <button 
            key={p.key}
            onClick={() => sendMessage(p.text)}
            className="shrink-0 px-3 py-1.5 rounded-full bg-gray-100 border border-gray-200 text-[11px] font-semibold text-gray-700 hover:bg-[#003366] hover:text-white transition-all whitespace-nowrap cursor-pointer"
          >
            {t(p.key, lang)}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <div className="px-3 py-2.5 bg-white border-t border-gray-200 flex items-center gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && input.trim()) sendMessage(input.trim()); }}
          placeholder={t('arthai.typePlaceholder', lang)}
          disabled={speaking}
          className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-xs sm:text-sm text-gray-800 border border-gray-200 outline-none focus:border-[#003366] focus:bg-white transition-all"
        />
        {input.trim() ? (
          <button 
            onClick={() => sendMessage(input.trim())}
            disabled={speaking}
            className="bg-[#FF6B00] text-white rounded-full p-2.5 cursor-pointer hover:bg-orange-600 transition-colors shadow-sm disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        ) : (
          <button 
            onClick={() => sendMessage('Show me low risk investment options')}
            disabled={speaking}
            className={`rounded-full p-2.5 cursor-pointer transition-colors ${speaking ? 'bg-rose-500 text-white animate-pulse' : 'bg-gray-100 text-gray-400 hover:text-gray-600'}`}
          >
            <Mic size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

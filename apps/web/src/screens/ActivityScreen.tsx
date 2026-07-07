import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '../store';
import { apiClient } from '../api/client';
import { Card, Chip } from '../components/DesignSystem';
import { ShieldCheck, History, Search, Download, AlertTriangle, FileText, Bot, Target } from 'lucide-react';
import { t } from '../data/i18n';

export function ActivityScreen() {
  const lang = useAppStore(state => state.language);
  const [filter, setFilter] = useState<'All' | 'Risk' | 'Advice' | 'Consent' | 'System'>('All');

  const { data: logs = [], isError } = useQuery({
    queryKey: ['auditLogs'],
    queryFn: async () => {
      const res = await apiClient.get('/audit');
      return res.data;
    },
    staleTime: 2 * 60 * 1000,
    placeholderData: []
  });

  const filteredLog = filter === 'All' ? logs : logs.filter((l: any) => l.category === filter);

  return (
    <div className="screen-enter flex flex-col h-full bg-[#F4F6F9]">
      {/* Header */}
      <div className="px-4 py-4 bg-white border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <History size={18} className="text-[#003366]" />
              {t('activity.header', lang)}
            </h1>
            <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
              <ShieldCheck size={12} className="text-emerald-600" />
              Cryptographically secured advisory trail
            </p>
          </div>
          <button className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors cursor-pointer">
            <Download size={16} />
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mt-4 overflow-x-auto phone-scroll pb-1">
          {(['All', 'Risk', 'Advice', 'Consent', 'System'] as const).map(f => (
            <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
              {f}
            </Chip>
          ))}
        </div>
      </div>

      {/* Log Feed */}
      <div className="flex-1 overflow-y-auto phone-scroll p-4 space-y-3">
        {filteredLog.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-xs font-medium">
            No audit records found for this category.
          </div>
        ) : (
          filteredLog.map((entry: any) => {
            let Icon = FileText;
            let iconColor = 'text-gray-500';
            let bgColor = 'bg-gray-100';

            if (entry.category === 'Risk') {
              Icon = AlertTriangle;
              iconColor = 'text-amber-600';
              bgColor = 'bg-amber-100';
            } else if (entry.category === 'Consent') {
              Icon = ShieldCheck;
              iconColor = 'text-emerald-600';
              bgColor = 'bg-emerald-100';
            } else if (entry.category === 'Advice') {
              Icon = Bot;
              iconColor = 'text-blue-600';
              bgColor = 'bg-blue-100';
            } else if (entry.category === 'System') {
              Icon = Target;
              iconColor = 'text-purple-600';
              bgColor = 'bg-purple-100';
            }

            return (
              <Card key={entry.id} className="p-3 shadow-xs border-l-4" style={{
                borderLeftColor: entry.category === 'Consent' ? '#10B981' : 
                                 entry.category === 'Risk' ? '#F59E0B' : 
                                 entry.category === 'Advice' ? '#3B82F6' : '#8B5CF6'
              }}>
                <div className="flex gap-3">
                  <div className={`p-2 rounded-xl shrink-0 h-fit ${bgColor}`}>
                    <Icon size={16} className={iconColor} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] font-bold tracking-wider uppercase text-gray-500">{entry.category}</span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 leading-tight mb-1">{entry.event}</h3>
                    
                    <div className="p-2 bg-gray-50 rounded-lg text-[10px] text-gray-600 font-medium leading-relaxed border border-gray-100 mt-2">
                      {JSON.stringify(entry.details, null, 2)}
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[8px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                        ID: {entry.id.slice(0, 8)}...
                      </span>
                      <span className="text-[8px] font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 flex items-center gap-1">
                        <ShieldCheck size={8} /> HASH: {entry.hash.slice(0, 8)}...
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

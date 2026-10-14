import React, { useState } from 'react';
import { useCompetition } from '../../context/CompetitionContext';
import { History, X, Search, Filter, Shield, Clock } from 'lucide-react';
import { SystemRole } from '../../types';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({ isOpen, onClose }) => {
  const { auditLogs, lang, t } = useCompetition();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  if (!isOpen) return null;

  const filteredLogs = auditLogs.filter((log) => {
    const matchesRole = roleFilter === 'all' || log.role === roleFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      log.action.toLowerCase().includes(term) ||
      log.actionAr.toLowerCase().includes(term) ||
      log.userName.toLowerCase().includes(term) ||
      log.details.toLowerCase().includes(term) ||
      log.entityType.toLowerCase().includes(term);
    return matchesRole && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-100 rounded-xl text-slate-800">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {lang === 'ar' ? 'سجل العمليات والتدقيق الأمني (Audit Log)' : 'System Audit & Activity Trail'}
              </h2>
              <p className="text-xs text-slate-500">
                {lang === 'ar'
                  ? 'سجل غير قابل للتعديل لجميع القرارات والاعتمادات وتغييرات الدرجات وتعديل المراحل'
                  : 'Immutable audit log tracking approvals, score edits, submissions, and status changes'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute top-2.5 start-3" />
            <input
              type="text"
              placeholder={t.common.search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full ps-9 pe-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="py-1.5 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">{lang === 'ar' ? 'كافة الأدوار' : 'All Roles'}</option>
              <option value="admin">Admin</option>
              <option value="school_rep">School Representative</option>
              <option value="student">Student</option>
              <option value="judge">Judge</option>
            </select>
          </div>

          <span className="text-xs text-slate-500 font-medium">
            {lang === 'ar' ? `${filteredLogs.length} عملية مسجلة` : `${filteredLogs.length} events`}
          </span>
        </div>

        {/* Log table */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {filteredLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                {lang === 'ar' ? 'لا توجد سجلات مطابقة للبحث' : 'No matching audit records found'}
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div key={log.id} className="p-3.5 hover:bg-slate-50 transition-colors flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {lang === 'ar' ? log.actionAr : log.action}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 whitespace-nowrap">
                        <Clock className="w-3 h-3" />
                        <span>{log.timestamp}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{log.details}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                        {log.userName} ({log.role})
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono">
                        {log.entityType}: {log.entityId}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            {t.actions.close}
          </button>
        </div>
      </div>
    </div>
  );
};

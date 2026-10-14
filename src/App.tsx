/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CompetitionProvider, useCompetition } from './context/CompetitionContext';
import { Navbar } from './components/common/Navbar';
import { PublicLandingPage } from './components/public/PublicLandingPage';
import { PublicResultsPage } from './components/public/PublicResultsPage';
import { SchoolDashboard } from './components/school/SchoolDashboard';
import { StudentDashboard } from './components/student/StudentDashboard';
import { JudgeDashboard } from './components/judge/JudgeDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AuditLogModal } from './components/common/AuditLogModal';
import { EdgeCasesModal } from './components/common/EdgeCasesModal';
import { Gamepad2, Trophy, Globe, Shield, Sparkles } from 'lucide-react';

const AppContent: React.FC = () => {
  const { role, lang, t, competition } = useCompetition();
  const [publicView, setPublicView] = useState<'landing' | 'results'>('landing');
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isEdgeCasesModalOpen, setIsEdgeCasesModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation & Role Switcher Bar */}
      <Navbar
        onOpenAuditLog={() => setIsAuditModalOpen(true)}
        onOpenEdgeCases={() => setIsEdgeCasesModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {/* Role Router */}
        {role === 'public' && (
          <div>
            {/* Sub-nav for public views */}
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPublicView('landing')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    publicView === 'landing'
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {lang === 'ar' ? 'البوابة الرئيسية للمسابقة' : 'Competition Portal'}
                </button>
                <button
                  onClick={() => setPublicView('results')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    publicView === 'results'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'النتائج ومنصة التتويج' : 'Winners Podium'}</span>
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
                <Shield className="w-3.5 h-3.5 text-indigo-600" />
                <span>
                  {lang === 'ar'
                    ? 'بوابة المسابقة الوطنية لتطوير الألعاب المدرسية 2026'
                    : 'National School Game Development Competition Portal 2026'}
                </span>
              </div>
            </div>

            {publicView === 'landing' ? (
              <PublicLandingPage onNavigateToResults={() => setPublicView('results')} />
            ) : (
              <PublicResultsPage />
            )}
          </div>
        )}

        {role === 'school_rep' && <SchoolDashboard />}

        {role === 'student' && <StudentDashboard />}

        {role === 'judge' && <JudgeDashboard />}

        {role === 'admin' && <AdminDashboard />}
      </main>

      {/* Global Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-sm">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900">
                {lang === 'ar' ? competition.nameAr : competition.nameEn}
              </p>
              <p className="text-[11px] text-slate-400">
                {lang === 'ar'
                  ? 'منظومة إدارة المسابقة المدرسية الموحدة المتكاملة مع LMS ومصفوفة التحكيم'
                  : 'Integrated School Competition Management, LMS Telemetry & Jury Governance'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setIsAuditModalOpen(true)}
              className="text-slate-600 hover:text-indigo-600 font-semibold cursor-pointer underline decoration-dotted"
            >
              {lang === 'ar' ? 'سجل التدقيق الأمني' : 'Security Audit Trail'}
            </button>
            <span>·</span>
            <button
              onClick={() => setIsEdgeCasesModalOpen(true)}
              className="text-slate-600 hover:text-indigo-600 font-semibold cursor-pointer underline decoration-dotted"
            >
              {lang === 'ar' ? 'محاكي الحالات الخاصة' : 'Edge Cases Simulator'}
            </button>
            <span>·</span>
            <span>© 2026 All Rights Reserved</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuditLogModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />

      <EdgeCasesModal
        isOpen={isEdgeCasesModalOpen}
        onClose={() => setIsEdgeCasesModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <CompetitionProvider>
      <AppContent />
    </CompetitionProvider>
  );
}

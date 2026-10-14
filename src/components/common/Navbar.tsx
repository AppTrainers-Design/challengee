import React, { useState } from 'react';
import { useCompetition } from '../../context/CompetitionContext';
import { StatusBadge } from './StatusBadge';
import {
  Gamepad2,
  Globe,
  Bell,
  Shield,
  School,
  GraduationCap,
  Users,
  Scale,
  RefreshCw,
  History,
  CheckCheck,
  ChevronDown,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { SystemRole } from '../../types';

interface NavbarProps {
  onOpenAuditLog: () => void;
  onOpenEdgeCases: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuditLog, onOpenEdgeCases }) => {
  const {
    lang,
    setLang,
    t,
    role,
    setRole,
    activePersonaId,
    setActivePersonaId,
    competition,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    resetToDefaults,
  } = useCompetition();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const roleOptions: {
    id: SystemRole;
    personaId: string;
    labelEn: string;
    labelAr: string;
    subEn: string;
    subAr: string;
    icon: React.ElementType;
  }[] = [
    {
      id: 'admin',
      personaId: 'admin',
      labelEn: 'Admin Superuser',
      labelAr: 'مدير المسابقة (Admin)',
      subEn: 'Full control over approvals, criteria, rankings, publishing',
      subAr: 'صلاحيات كاملة للتحكم بالمسابقة والاعتمادات والنتائج',
      icon: Shield,
    },
    {
      id: 'school_rep',
      personaId: 'school-al-nahda',
      labelEn: 'School Representative',
      labelAr: 'ممثل المدرسة (School Rep)',
      subEn: 'Prof. Muna Al-Sayed · Al-Nahda Modern School',
      subAr: 'أ.د. منى السيد · مدرسة النهضة الحديثة',
      icon: School,
    },
    {
      id: 'student',
      personaId: 'std-ahmad',
      labelEn: 'Student (Team Leader)',
      labelAr: 'طالب / قائد الفريق (Student)',
      subEn: 'Ahmad Al-Mansoor · Team Pixel Heroes',
      subAr: 'أحمد المنصور · فريق Pixel Heroes',
      icon: GraduationCap,
    },
    {
      id: 'instructor',
      personaId: 'inst-zaid',
      labelEn: 'LMS Training Instructor',
      labelAr: 'مدرب المعسكر التدريبي (Instructor)',
      subEn: 'Eng. Zaid Al-Najjar · Game Development 101',
      subAr: 'م. زيد النجار · تدريب تطوير الألعاب',
      icon: Users,
    },
    {
      id: 'judge',
      personaId: 'judge-layla',
      labelEn: 'Judge / Evaluator',
      labelAr: 'المحكّم / المقيّم (Judge)',
      subEn: 'Dr. Layla Al-Hassan · Senior Game Director',
      subAr: 'د. ليلى الحسن · خبيرة ومخرجة ألعاب',
      icon: Scale,
    },
    {
      id: 'public',
      personaId: 'public',
      labelEn: 'Public Visitor',
      labelAr: 'الزائر العام (Public)',
      subEn: 'Public Landing, Timeline, Guidelines & Results',
      subAr: 'البوابة العامة، الجدول الزمني، الشروط والنتائج الرسمية',
      icon: Globe,
    },
  ];

  const currentRoleConfig = roleOptions.find((r) => r.id === role) || roleOptions[0];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Banner indicating interactive multi-role prototype */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-4 py-1.5 text-xs font-medium flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-emerald-300">
            {lang === 'ar' ? 'نموذج نظام تحدي التطبيقات 2026' : 'App Challenge 2026 Interactive System'}
          </span>
          <span className="hidden md:inline text-slate-300">|</span>
          <span className="hidden md:inline text-slate-300">
            {lang === 'ar'
              ? 'مدمج مع نظام إدارة التعلم (LMS) للتأهيل والتدريب والتحكيم'
              : 'End-to-end LMS Integrated Competition Module'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenEdgeCases}
            className="flex items-center gap-1 text-indigo-200 hover:text-white transition-colors cursor-pointer"
            title="Open Edge Cases & Simulations"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="font-semibold">{lang === 'ar' ? 'محاكي الحالات الخاصة' : 'Edge Cases Simulator'}</span>
          </button>
          <span className="text-slate-600">|</span>
          <button
            onClick={onOpenAuditLog}
            className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <History className="w-3.5 h-3.5" />
            <span>{t.nav.audit}</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900">
                {lang === 'ar' ? competition.nameAr : competition.nameEn}
              </span>
              <StatusBadge status={competition.status} size="sm" />
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              {lang === 'ar' ? 'المسابقة الوطنية لألعاب المدارس' : 'National School Game Development Competition'}
            </p>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-slate-800 cursor-pointer"
            >
              <currentRoleConfig.icon className="w-4 h-4 text-indigo-600" />
              <div className="text-start hidden sm:block">
                <span className="block text-[10px] text-slate-500 font-normal leading-tight">
                  {lang === 'ar' ? 'الدور الفعّال' : 'Active Role'}
                </span>
                <span className="leading-tight">
                  {lang === 'ar' ? currentRoleConfig.labelAr : currentRoleConfig.labelEn}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showRoleMenu && (
              <div
                className={`absolute ${
                  lang === 'ar' ? 'left-0' : 'right-0'
                } mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50`}
              >
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-800">{t.nav.switchRole}</p>
                  <p className="text-[11px] text-slate-500">
                    {lang === 'ar' ? 'اختر الدور لتجربة لوحة التحكم الخاصة به' : 'Select a persona to test their specific dashboard'}
                  </p>
                </div>

                <div className="p-1 space-y-0.5">
                  {roleOptions.map((opt) => {
                    const isSelected = role === opt.id;
                    const IconComp = opt.icon;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setRole(opt.id);
                          setActivePersonaId(opt.personaId);
                          setShowRoleMenu(false);
                        }}
                        className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-start transition-colors cursor-pointer ${
                          isSelected ? 'bg-indigo-50 text-indigo-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div
                          className={`p-1.5 rounded-md mt-0.5 ${
                            isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold leading-tight">
                            {lang === 'ar' ? opt.labelAr : opt.labelEn}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">
                            {lang === 'ar' ? opt.subAr : opt.subEn}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title={t.notifications.title}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <div
                className={`absolute ${
                  lang === 'ar' ? 'left-0' : 'right-0'
                } mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50`}
              >
                <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-bold text-slate-800">{t.notifications.title}</span>
                    <span className="px-1.5 py-0.5 text-[10px] bg-indigo-50 text-indigo-700 rounded-md font-semibold">
                      {unreadCount}
                    </span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>{t.notifications.markAllAsRead}</span>
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-xs text-slate-500 text-center">{t.notifications.noNotifications}</p>
                  ) : (
                    notifications.slice(0, 8).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`p-3 text-xs transition-colors cursor-pointer ${
                          n.isRead ? 'bg-white opacity-75' : 'bg-indigo-50/40 hover:bg-indigo-50/70'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`font-bold ${
                              n.type === 'success'
                                ? 'text-emerald-700'
                                : n.type === 'warning'
                                ? 'text-amber-700'
                                : n.type === 'deadline'
                                ? 'text-rose-700'
                                : 'text-blue-700'
                            }`}
                          >
                            {lang === 'ar' ? n.titleAr : n.titleEn}
                          </span>
                          <span className="text-[10px] text-slate-400">{n.timestamp.slice(5)}</span>
                        </div>
                        <p className="text-slate-600 leading-snug">{lang === 'ar' ? n.messageAr : n.messageEn}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Language Switcher */}
          <button
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 transition-colors cursor-pointer"
            title="Switch Language"
          >
            <Globe className="w-4 h-4 text-slate-500" />
            <span>{lang === 'en' ? 'العربية' : 'English'}</span>
          </button>

          {/* Reset Demo Data Button */}
          <button
            onClick={() => {
              if (window.confirm(lang === 'ar' ? 'هل أنت متأكد من إعادة ضبط كافة البيانات إلى الحالة الافتراضية؟' : 'Reset all demonstration data to defaults?')) {
                resetToDefaults();
              }
            }}
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
            title={t.nav.resetData}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

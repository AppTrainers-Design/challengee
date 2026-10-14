import React, { useState } from 'react';
import { useCompetition } from '../../context/CompetitionContext';
import { StatusBadge } from '../common/StatusBadge';
import { Stepper } from '../common/Stepper';
import { JoinTeamFlowModal } from './JoinTeamFlowModal';
import {
  GraduationCap,
  Users,
  Gamepad2,
  BookOpen,
  Calendar,
  Clock,
  Send,
  Save,
  CheckCircle2,
  Upload,
  ExternalLink,
  FileText,
  AlertTriangle,
  Sparkles,
  History,
  Lock,
  Play,
  KeyRound,
  ArrowRight,
  Copy,
  Check,
  School,
  Trophy,
} from 'lucide-react';
import { GameSubmission } from '../../types';

export const StudentDashboard: React.FC = () => {
  const {
    lang,
    t,
    competition,
    currentStudent,
    currentTeam,
    teams,
    schools,
    students,
    lmsCourse,
    studentProgress,
    submissions,
    saveSubmissionDraft,
    finalSubmitGame,
    joinTeamWithCode,
  } = useCompetition();

  const [activeTab, setActiveTab] = useState<'overview' | 'training' | 'submission'>('overview');
  const [inputCode, setInputCode] = useState('');
  const [joinMsg, setJoinMsg] = useState<{ success: boolean; text: string } | null>(null);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Existing submission or draft
  const currentSubmission = submissions.find((s) => s.teamId === currentTeam?.id);

  const [formState, setFormState] = useState<Partial<GameSubmission>>({
    gameNameEn: currentSubmission?.gameNameEn || 'Space Adventure: Galactic Relay',
    gameNameAr: currentSubmission?.gameNameAr || 'مغامرة الفضاء: مرحل المجرة',
    shortDescEn: currentSubmission?.shortDescEn || 'A thrilling 2D gravity-defying puzzle platformer.',
    shortDescAr: currentSubmission?.shortDescAr || 'لعبة منصات ثنائية الأبعاد تتحدى الجاذبية.',
    fullDescEn: currentSubmission?.fullDescEn || 'Interstellar engineer navigating damaged orbital relays with magnetic thrusters.',
    fullDescAr: currentSubmission?.fullDescAr || 'مهندس محطات فضائية في مدار كبلر يصلح المحطات بدفعات مغناطيسية.',
    genre: currentSubmission?.genre || 'Sci-Fi Puzzle Platformer',
    targetPlatform: currentSubmission?.targetPlatform || 'Web',
    webGameUrl: currentSubmission?.webGameUrl || 'https://itch.io/embed-upload/example-space-adventure',
    buildDownloadUrl: currentSubmission?.buildDownloadUrl || 'https://github.com/app-challenge/space-adventure.zip',
    gameplayVideoUrl: currentSubmission?.gameplayVideoUrl || 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    pitchDeckUrl: currentSubmission?.pitchDeckUrl || 'https://example.com/docs/space-adventure-pitch-deck.pdf',
    gddDocumentUrl: currentSubmission?.gddDocumentUrl || 'https://example.com/docs/space-adventure-gdd.pdf',
  });

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const teamMembers = students.filter((s) => currentTeam?.memberIds.includes(s.id));
  const myProgress = studentProgress.find((p) => p.studentId === currentStudent?.id);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    const res = joinTeamWithCode(currentStudent?.id || 'std-ahmad', inputCode);
    setJoinMsg({ success: res.success, text: res.message });
    if (res.success) setInputCode('');
  };

  const handleSaveDraft = () => {
    if (!currentTeam) return;
    saveSubmissionDraft({
      ...formState,
      teamId: currentTeam.id,
    });
    setActionNotice(lang === 'ar' ? 'تم حفظ المسودة بنجاح! يمكنك العودة وتعديلها لاحقاً.' : 'Draft saved successfully! You can return and continue editing.');
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleFinalSubmit = () => {
    if (!currentTeam) return;
    finalSubmitGame({
      ...formState,
      teamId: currentTeam.id,
    });
    setShowConfirmModal(false);
    setActionNotice(lang === 'ar' ? 'تم تسليم اللعبة رسمياً للجنة التحكيم! تم قفل الاستمارة.' : 'Final game build submitted! The submission is now locked for evaluation.');
  };

  const isLocked = currentSubmission?.status === 'submitted' || currentSubmission?.status === 'locked';

  return (
    <div className="space-y-8 pb-12">
      {/* Student Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-black text-slate-900">{currentStudent?.fullName}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {currentStudent?.isLeader ? (lang === 'ar' ? '👑 قائد الفريق' : '👑 Team Leader') : 'Team Member'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {currentStudent?.grade} · {currentStudent?.email} · 🏫 Al-Nahda Modern School
            </p>
            {currentTeam && (
              <p className="text-xs font-semibold text-blue-600 mt-1">
                {lang === 'ar' ? 'الفريق المسجل به:' : 'Assigned Team:'} <strong>{currentTeam.teamName}</strong> (Code:{' '}
                <span className="font-mono bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                  {currentTeam.teamCode}
                </span>
                )
              </p>
            )}
          </div>
        </div>

        {/* Join team if not in a team */}
        {!currentTeam && (
          <form onSubmit={handleJoin} className="flex items-center gap-2">
            <input
              type="text"
              placeholder={lang === 'ar' ? 'أدخل رمز الفريق...' : 'Enter Team Code...'}
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg uppercase font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 cursor-pointer"
            >
              {lang === 'ar' ? 'انضمام' : 'Join'}
            </button>
          </form>
        )}
      </div>

      {joinMsg && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold ${
            joinMsg.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {joinMsg.text}
        </div>
      )}

      {/* Stepper */}
      <Stepper currentStatus={competition.status} />

      {/* APP CHALLENGE 2026 OFFICIAL CARD: TEAM STATUS & PROGRESS */}
      {currentTeam ? (
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-800/60 relative overflow-hidden">
          <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-800/60 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {competition.year} Official Entry
                  </span>
                  <StatusBadge status={currentTeam.status} size="sm" />
                </div>
                <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>{currentTeam.teamName}</span>
                  {currentStudent?.isLeader && (
                    <span className="text-xs bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-bold">
                      {lang === 'ar' ? 'أنت قائد الفريق' : 'You are Leader'}
                    </span>
                  )}
                </h2>
                <p className="text-xs text-indigo-200/80 flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-indigo-300" />
                  <span>
                    {schools.find((s) => s.id === currentTeam.schoolId)?.nameEn || 'Al-Nahda Modern School'}
                  </span>
                  <span>•</span>
                  <span>Mentor: {currentTeam.mentorName}</span>
                </p>
              </div>

              {/* Team Code & Share Box */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex items-center gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-indigo-200 block">
                    {lang === 'ar' ? 'رمز الفريق للانضمام' : 'Team Invitation Code'}
                  </span>
                  <span className="font-mono font-black text-base text-amber-300 tracking-wider">
                    {currentTeam.teamCode}
                  </span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(currentTeam.teamCode);
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="Copy Team Code"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Progress Pillars: Registration -> Training -> Development -> Submission */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              {/* Pillar 1: Team Roster Capacity */}
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-indigo-200 font-semibold flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-indigo-400" />
                    <span>{lang === 'ar' ? 'اكتمال الفريق' : 'Team Roster'}</span>
                  </span>
                  <span className="font-bold text-white">
                    {teamMembers.length} / {competition.maxStudentsPerTeam}
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-400 h-2 rounded-full transition-all"
                    style={{ width: `${(teamMembers.length / competition.maxStudentsPerTeam) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-300">
                  {teamMembers.length >= competition.minStudentsPerTeam
                    ? lang === 'ar'
                      ? '✓ استوفى الفريق الحد الأدنى للأعضاء'
                      : '✓ Minimum team requirement met'
                    : lang === 'ar'
                    ? `متبقي ${competition.minStudentsPerTeam - teamMembers.length} طلاب للاكتمال`
                    : `Needs ${competition.minStudentsPerTeam - teamMembers.length} more students`}
                </p>
              </div>

              {/* Pillar 2: LMS Training Progress */}
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-indigo-200 font-semibold flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-cyan-400" />
                    <span>{lang === 'ar' ? 'تدريب LMS' : 'LMS Bootcamp'}</span>
                  </span>
                  <span className="font-bold text-white">{myProgress?.progressPercentage || 85}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-cyan-400 h-2 rounded-full transition-all"
                    style={{ width: `${myProgress?.progressPercentage || 85}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-300">
                  {lang === 'ar'
                    ? `أتممت ${myProgress?.completedLessons?.length || 6} من 7 دروس تدريبية`
                    : `Completed ${myProgress?.completedLessons?.length || 6} of 7 training lessons`}
                </p>
              </div>

              {/* Pillar 3: Submission Status */}
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-indigo-200 font-semibold flex items-center gap-1.5">
                    <Gamepad2 className="w-4 h-4 text-amber-400" />
                    <span>{lang === 'ar' ? 'حالة تسليم اللعبة' : 'Game Submission'}</span>
                  </span>
                  <span className="font-bold text-amber-300">
                    {currentSubmission?.status === 'submitted'
                      ? lang === 'ar'
                        ? 'تم التسليم'
                        : 'Submitted'
                      : lang === 'ar'
                      ? 'مسودة قيد العمل'
                      : 'Draft In Progress'}
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      currentSubmission?.status === 'submitted' ? 'bg-emerald-400 w-full' : 'bg-amber-400 w-2/3'
                    }`}
                  />
                </div>
                <p className="text-[11px] text-slate-300">
                  {currentSubmission?.status === 'submitted'
                    ? lang === 'ar'
                      ? '✓ اللعبة مقفلة ومحالة للتحكيم'
                      : '✓ Locked & assigned for evaluation'
                    : lang === 'ar'
                    ? 'الموعد النهائي: 12 نوفمبر 2026'
                    : `Deadline: ${competition.submissionDeadline}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Not yet in a team - High visual impact CTA card */
        <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-indigo-500/40 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'تنبيه: أنت غير منضم لأي فريق بعد' : 'Action Required: No Team Joined Yet'}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {lang === 'ar' ? 'انضم إلى فريق مدرستك في تحدي التطبيقات 2026' : 'Join Your School Team for App Challenge 2026'}
            </h2>

            <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed">
              {lang === 'ar'
                ? 'للمشاركة في تدريب LMS وتسليم لعبة مدرستك، اطلب رمز الفريق (Team Code) من معلمك أو مشرف الحاسوب في مدرستك وأدخله هنا.'
                : 'To participate in LMS bootcamp training and collaborate on your game build, obtain your Team Code from your teacher or school coordinator and enter it below.'}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsJoinModalOpen(true)}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2 cursor-pointer border border-emerald-400/30"
              >
                <KeyRound className="w-4 h-4" />
                <span>{lang === 'ar' ? 'إدخال رمز الفريق والانضمام' : 'Enter Team Code & Join Team'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setInputCode('APP26-PX73K');
                  const res = joinTeamWithCode(currentStudent?.id || 'std-dema', 'APP26-PX73K');
                  setJoinMsg({ success: res.success, text: res.message });
                }}
                className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{lang === 'ar' ? 'تجربة انضمام سريع (APP26-PX73K)' : 'Quick Demo Join (APP26-PX73K)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {actionNotice && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs">
          <span>{actionNotice}</span>
          <button onClick={() => setActionNotice(null)} className="cursor-pointer text-slate-500">
            ✕
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 flex gap-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors border-b-2 ${
            activeTab === 'overview'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{lang === 'ar' ? 'فريقي والأعضاء' : 'My Team & Members'}</span>
        </button>

        <button
          onClick={() => setActiveTab('training')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors border-b-2 ${
            activeTab === 'training'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>{lang === 'ar' ? 'معسكر التدريب (LMS)' : 'LMS Training Course'}</span>
        </button>

        <button
          onClick={() => setActiveTab('submission')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors border-b-2 ${
            activeTab === 'submission'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Gamepad2 className="w-4 h-4" />
          <span>{lang === 'ar' ? 'تسليم اللعبة للتحكيم' : 'Game Submission'}</span>
          {isLocked && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
              Submitted
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Overview & Team Roster */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900">{currentTeam?.teamName}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{currentTeam?.description}</p>
              </div>
              <StatusBadge status={currentTeam?.status || 'approved'} size="md" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-500 uppercase block text-[10px]">
                  {lang === 'ar' ? 'المشرف الأكاديمي' : 'Mentor / Teacher'}
                </span>
                <span className="text-sm font-bold text-slate-800">{currentTeam?.mentorName || 'Eng. Zaid Al-Najjar'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-500 uppercase block text-[10px]">
                  {lang === 'ar' ? 'رمز الانضمام الرسمي' : 'Team Invitation Code'}
                </span>
                <span className="text-sm font-mono font-bold text-blue-700">{currentTeam?.teamCode}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                {lang === 'ar' ? 'أعضاء الفريق المسجلين' : 'Official Team Members'}
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {teamMembers.map((m) => (
                  <div key={m.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50">
                    <div>
                      <span className="font-bold text-slate-900">
                        {m.fullName} {m.isLeader && '👑 (Leader)'}
                      </span>
                      <span className="text-[11px] text-slate-500 block">{m.grade} · {m.nationality}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: LMS Training Course */}
      {activeTab === 'training' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                  {lang === 'ar' ? 'دورة LMS المعتمدة' : 'Integrated LMS Course'}
                </span>
                <h2 className="text-lg font-black text-slate-900 mt-0.5">
                  {lang === 'ar' ? lmsCourse.titleAr : lmsCourse.titleEn}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  👨‍🏫 <strong>{lang === 'ar' ? 'المدرب:' : 'Instructor:'}</strong> {lmsCourse.instructorName} (
                  {lmsCourse.durationDays} {lang === 'ar' ? 'أيام تدريبية مكثفة' : 'Day Intensive Bootcamp'})
                </p>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 shrink-0">
                <span className="block font-bold">
                  {lang === 'ar' ? 'حالة تقدمك في الدورة:' : 'Your Course Progress:'}
                </span>
                <span className="text-lg font-black">{myProgress?.attendanceRate || 100}%</span>
                <span className="text-[11px] text-emerald-700 block">
                  {myProgress?.completedSessions || 7}/{myProgress?.totalSessions || 7} Sessions Completed
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {lang === 'ar' ? lmsCourse.descriptionAr : lmsCourse.descriptionEn}
            </p>
          </div>

          {/* Sessions List */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              {lang === 'ar' ? 'جلسات ومحاضرات الدورة التدريبية' : 'Curriculum Sessions & Materials'}
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {lmsCourse.sessions.map((sess) => (
                <div
                  key={sess.id}
                  className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-indigo-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-black text-xs shrink-0">
                      D{sess.dayNumber}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">
                        {lang === 'ar' ? sess.titleAr : sess.titleEn}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{sess.duration}</span>
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold uppercase">
                          {sess.type}
                        </span>
                        {sess.assignmentTitle && (
                          <span className="text-blue-600 font-semibold">📝 {sess.assignmentTitle}</span>
                        )}
                        {sess.quizTitle && (
                          <span className="text-purple-600 font-semibold">🎯 {sess.quizTitle}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => alert(`Opening LMS Session: ${sess.titleEn}`)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>{lang === 'ar' ? 'مشاهدة الجلسة' : 'View Lecture'}</span>
                    </button>
                    <span className="p-1 text-emerald-600" title="Completed">
                      <CheckCircle2 className="w-5 h-5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Game Submission Form */}
      {activeTab === 'submission' && (
        <div className="space-y-6">
          {/* Deadline Countdown Header */}
          <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-2xl p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                {lang === 'ar' ? 'المرحلة الحالية: تطوير وتسليم الألعاب' : 'Active Phase: Game Development & Submission'}
              </span>
              <h2 className="text-xl font-black mt-1">
                {lang === 'ar' ? 'استمارة تسليم اللعبة الرسمية للتحكيم' : 'Official Game Submission Form'}
              </h2>
              <p className="text-xs text-purple-200 mt-0.5">
                {lang === 'ar'
                  ? 'الموعد النهائي: 18 سبتمبر 2026 الساعة 11:59 مساءً · بعد الموعد يُقفل التسليم تلقائياً'
                  : `Submission Deadline: ${competition.submissionDeadline} · Automatic lock upon deadline expiry`}
              </p>
            </div>

            <div className="p-3 bg-white/10 rounded-xl border border-white/20 text-center shrink-0">
              <span className="text-[10px] text-purple-200 uppercase font-bold block">
                {lang === 'ar' ? 'الوقت المتبقي' : 'Countdown'}
              </span>
              <span className="text-xl font-black font-mono">04D : 12H : 30M</span>
            </div>
          </div>

          {/* Submission Status Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {lang === 'ar' ? 'بيانات اللعبة وملفات التسليم' : 'Game Artifacts & Build Details'}
                </h3>
                <p className="text-xs text-slate-500">
                  {lang === 'ar'
                    ? 'يحق لجميع أعضاء الفريق الاطلاع، وقائد الفريق يمكنه اعتماد التسليم النهائي.'
                    : 'All team members can inspect; Team Leader approves final locking.'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={currentSubmission?.status || 'draft'} size="md" />
                {isLocked && (
                  <span className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded font-bold border border-emerald-200">
                    <Lock className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'مقفل للتسليم' : 'Locked'}</span>
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {lang === 'ar' ? 'اسم اللعبة (بالإنجليزية) *' : 'Game Name (English) *'}
                </label>
                <input
                  type="text"
                  disabled={isLocked}
                  value={formState.gameNameEn}
                  onChange={(e) => setFormState({ ...formState, gameNameEn: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {lang === 'ar' ? 'اسم اللعبة (بالعربية) *' : 'Game Name (Arabic) *'}
                </label>
                <input
                  type="text"
                  disabled={isLocked}
                  value={formState.gameNameAr}
                  onChange={(e) => setFormState({ ...formState, gameNameAr: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {lang === 'ar' ? 'نوع وتصنيف اللعبة (Genre) *' : 'Game Genre *'}
                </label>
                <input
                  type="text"
                  disabled={isLocked}
                  placeholder="e.g. Sci-Fi Puzzle Platformer"
                  value={formState.genre}
                  onChange={(e) => setFormState({ ...formState, genre: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {lang === 'ar' ? 'المنصة المستهدفة *' : 'Target Platform *'}
                </label>
                <select
                  disabled={isLocked}
                  value={formState.targetPlatform}
                  onChange={(e) => setFormState({ ...formState, targetPlatform: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white disabled:bg-slate-50 cursor-pointer"
                >
                  <option value="Web">Web (HTML5 / WebAssembly)</option>
                  <option value="Windows">Windows (EXE)</option>
                  <option value="Android">Android (APK)</option>
                  <option value="iOS">iOS</option>
                  <option value="Cross-Platform">Cross-Platform</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  {lang === 'ar' ? 'وصف مختصر لفكرة اللعبة (Elevator Pitch)' : 'Short Description / Elevator Pitch'}
                </label>
                <input
                  type="text"
                  disabled={isLocked}
                  value={formState.shortDescEn}
                  onChange={(e) => setFormState({ ...formState, shortDescEn: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-slate-50"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  {lang === 'ar' ? 'الوصف التفصيلي لميكانيكا اللعبة والعالم' : 'Detailed Narrative & Mechanics Description'}
                </label>
                <textarea
                  rows={3}
                  disabled={isLocked}
                  value={formState.fullDescEn}
                  onChange={(e) => setFormState({ ...formState, fullDescEn: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-slate-50"
                />
              </div>

              {/* Build Access */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {lang === 'ar' ? 'رابط تشغيل اللعبة المباشر (Web URL)' : 'Playable Web Game URL'}
                </label>
                <input
                  type="url"
                  disabled={isLocked}
                  value={formState.webGameUrl}
                  onChange={(e) => setFormState({ ...formState, webGameUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {lang === 'ar' ? 'رابط تحميل ملف اللعبة (Build ZIP/APK)' : 'Downloadable Build Package URL (ZIP/APK)'}
                </label>
                <input
                  type="url"
                  disabled={isLocked}
                  value={formState.buildDownloadUrl}
                  onChange={(e) => setFormState({ ...formState, buildDownloadUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-slate-50"
                />
              </div>

              {/* Video & Documents */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {lang === 'ar' ? 'فيديو تجربة اللعب (Gameplay Video - 2 min)' : 'Gameplay Video URL (2 min)'}
                </label>
                <input
                  type="url"
                  disabled={isLocked}
                  value={formState.gameplayVideoUrl}
                  onChange={(e) => setFormState({ ...formState, gameplayVideoUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {lang === 'ar' ? 'رابط العرض التقديمي (Pitch Deck PDF) *' : 'Pitch Presentation Deck (PDF) *'}
                </label>
                <input
                  type="url"
                  disabled={isLocked}
                  value={formState.pitchDeckUrl}
                  onChange={(e) => setFormState({ ...formState, pitchDeckUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-slate-50"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  {lang === 'ar' ? 'وثيقة تصميم اللعبة (Game Design Document - GDD PDF) *' : 'Game Design Document (GDD PDF) *'}
                </label>
                <input
                  type="url"
                  disabled={isLocked}
                  value={formState.gddDocumentUrl}
                  onChange={(e) => setFormState({ ...formState, gddDocumentUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-slate-50"
                />
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs text-slate-500">
                {currentSubmission?.lastSavedAt && (
                  <span>
                    {lang === 'ar' ? 'آخر حفظ:' : 'Last saved:'} {currentSubmission.lastSavedAt} (v
                    {currentSubmission.currentVersion})
                  </span>
                )}
              </div>

              {!isLocked ? (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{t.actions.saveDraft}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowConfirmModal(true)}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{t.actions.finalSubmit}</span>
                  </button>
                </div>
              ) : (
                <div className="text-xs text-emerald-700 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {lang === 'ar'
                      ? 'تم قفل الاستمارة وتسليم النسخة رسمياً للتحكيم.'
                      : 'Final build submitted and locked for judging.'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Submission Version History Box */}
          {currentSubmission && currentSubmission.versions.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-600" />
                <span>{lang === 'ar' ? 'سجل إصدارات التسليم (Version History)' : 'Submission Version History'}</span>
              </h3>

              <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden text-xs">
                {currentSubmission.versions.map((ver) => (
                  <div key={ver.versionNumber} className="p-3.5 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900">v{ver.versionNumber}.0</span>
                        <span className="font-semibold text-indigo-700">{ver.gameNameEn}</span>
                      </div>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        {ver.shortDesc} · 👤 {ver.submittedBy}
                      </p>
                    </div>
                    <span className="text-[11px] text-slate-400">{ver.submittedAt}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-center">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Send className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-slate-900">
              {lang === 'ar' ? 'تأكيد التسليم النهائي للعبة' : 'Confirm Final Game Submission'}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {lang === 'ar'
                ? 'هل أنت متأكد من تسليم اللعبة؟ يرجى التحقق من صحة جميع الروابط والملفات. بعد التأكيد سيتم قفل التسليم وإرساله فوراً إلى لجنة التحكيم.'
                : 'Are you sure you want to submit your final game? Please verify all uploaded files and playable links. After confirmation, editing will be locked.'}
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                {t.actions.cancel}
              </button>
              <button
                onClick={handleFinalSubmit}
                className="px-6 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm"
              >
                {lang === 'ar' ? 'نعم، تسليم نهائي' : 'Yes, Final Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Team Modal for students */}
      <JoinTeamFlowModal
        isOpen={isJoinModalOpen}
        initialCode={inputCode}
        onClose={() => {
          setIsJoinModalOpen(false);
          setInputCode('');
        }}
      />
    </div>
  );
};

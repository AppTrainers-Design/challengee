import React, { useState } from 'react';
import { useCompetition } from '../../context/CompetitionContext';
import { StatusBadge } from '../common/StatusBadge';
import { Stepper } from '../common/Stepper';
import { SchoolRegistrationModal } from './SchoolRegistrationModal';
import { JoinTeamFlowModal } from '../student/JoinTeamFlowModal';
import {
  Gamepad2,
  Calendar,
  Users,
  Award,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Sparkles,
  BookOpen,
  Send,
  Layers,
  FileText,
  ShieldCheck,
  School,
  GraduationCap,
  KeyRound,
  ExternalLink,
} from 'lucide-react';

interface PublicLandingPageProps {
  onNavigateToResults: () => void;
  onNavigateToTeam?: (teamId: string) => void;
}

export const PublicLandingPage: React.FC<PublicLandingPageProps> = ({ onNavigateToResults, onNavigateToTeam }) => {
  const { lang, t, competition, setRole } = useCompetition();
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isJoinTeamModalOpen, setIsJoinTeamModalOpen] = useState(false);
  const [joinTeamCode, setJoinTeamCode] = useState<string>('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleOpenJoinWithCode = (code: string) => {
    setJoinTeamCode(code);
    setIsJoinTeamModalOpen(true);
  };

  const faqs = [
    {
      qEn: 'Who can register a school for App Challenge 2026?',
      qAr: 'من يحق له تسجيل المدرسة في مسابقة تحدي التطبيقات 2026؟',
      aEn: 'An authorized school representative (Head of Computer Science, STEM Supervisor, or Principal). Students cannot register teams individually until the school is approved.',
      aAr: 'يتم التسجيل حصراً عبر ممثل رسمي مفوض من المدرسة (رئيس قسم الحاسوب، مشرف STEM، أو المدير). لا يُسمح للطلاب بالتسجيل المستقل قبل اعتماد المدرسة.',
    },
    {
      qEn: 'How many students can be on each team?',
      qAr: 'كم عدد الطلاب المسموح به في كل فريق؟',
      aEn: `Each team must have between ${competition.minStudentsPerTeam} and ${competition.maxStudentsPerTeam} registered students. Schools can form up to ${competition.maxTeamsPerSchool} official teams.`,
      aAr: `يتكون كل فريق من ${competition.minStudentsPerTeam} إلى ${competition.maxStudentsPerTeam} طلاب مسجلين. يحق للمدرسة تشكيل ما يصل إلى ${competition.maxTeamsPerSchool} فرق معتمدة.`,
    },
    {
      qEn: 'How does the training phase integrate with the LMS?',
      qAr: 'كيف ترتبط مرحلة التدريب بنظام إدارة التعلم (LMS)؟',
      aEn: 'Once a team is approved, all students are enrolled automatically into the LMS Game Development Bootcamp course. Attendance, assignments, and quizzes are tracked in real-time.',
      aAr: 'بمجرد اعتماد الفريق، يتم تسجيل جميع الطلاب تلقائياً في معسكر تطوير الألعاب على منصة LMS ومتابعة الحضور والواجبات والاختبارات بصورة حية.',
    },
    {
      qEn: 'What files are required for the final game submission?',
      qAr: 'ما هي الملفات المطلوبة للتسليم النهائي للعبة؟',
      aEn: 'A playable build or web URL, Game Design Document (GDD), 2-minute gameplay video, pitch deck presentation, game logo, and screenshots.',
      aAr: 'نسخة قابلة للعب أو رابط ويب تفاعلي، وثيقة تصميم اللعبة (GDD)، فيديو تجربة اللعب (دقيقتان)، العرض التقديمي، وشعار ولقطات شاشة.',
    },
    {
      qEn: 'How is judging conducted fairly?',
      qAr: 'كيف تضمن المسابقة نزاهة التحكيم؟',
      aEn: 'Submissions are scored by verified game industry judges across 7 weighted criteria totaling 100 points. Blind Evaluation mode masks school names to eliminate bias.',
      aAr: 'يتم التقييم بواسطة خبراء ألعاب معتمدين عبر 7 معايير مدروسة بمجموع 100 نقطة، مع دعم نظام "التحكيم الأعمى" لحجب هوية المدارس عن المحكمين.',
    },
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 lg:p-16 shadow-2xl border border-indigo-900/50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.25),transparent)] pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>{competition.year} Edition</span>
            </span>
            <StatusBadge status={competition.status} size="md" />
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            {lang === 'ar' ? competition.nameAr : competition.nameEn}
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {lang === 'ar' ? competition.descriptionAr : competition.descriptionEn}
          </p>

          {/* Action CTAs - Clearly separated for School Reps and Students */}
          <div className="flex flex-wrap items-center gap-3 pt-4">
            <button
              onClick={() => {
                setJoinTeamCode('APP26-PX73K');
                setIsJoinTeamModalOpen(true);
              }}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2 cursor-pointer border border-emerald-400/30 ring-2 ring-emerald-400/20"
            >
              <GraduationCap className="w-4 h-4 text-emerald-100" />
              <span>{lang === 'ar' ? 'انضم لفريق مدرستك (للطلاب)' : 'Join Your School Team (Students)'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
            >
              <School className="w-4 h-4 text-indigo-200" />
              <span>{lang === 'ar' ? 'سجّل مدرستك (لممثلي المدارس)' : 'Register Your School (School Reps)'}</span>
            </button>

            <button
              onClick={onNavigateToResults}
              className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all border border-white/20 flex items-center gap-2 cursor-pointer"
            >
              <Award className="w-4 h-4 text-amber-300" />
              <span>{lang === 'ar' ? 'عرض النتائج الرسمية' : 'View Official Results'}</span>
            </button>
          </div>

          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-800/80 text-xs">
            <div>
              <span className="text-slate-400 block">{lang === 'ar' ? 'الفئة المستهدفة' : 'Eligibility'}</span>
              <span className="font-bold text-white text-sm">Grades 7–12</span>
            </div>
            <div>
              <span className="text-slate-400 block">{lang === 'ar' ? 'فترة التدريب' : 'LMS Training'}</span>
              <span className="font-bold text-white text-sm">7 Intensive Days</span>
            </div>
            <div>
              <span className="text-slate-400 block">{lang === 'ar' ? 'حجم الفريق' : 'Team Size'}</span>
              <span className="font-bold text-white text-sm">3–5 Students</span>
            </div>
            <div>
              <span className="text-slate-400 block">{lang === 'ar' ? 'معايير التحكيم' : 'Total Rubric'}</span>
              <span className="font-bold text-amber-400 text-sm">100 Points</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stepper overview */}
      <Stepper currentStatus={competition.status} />

      {/* TWO PRIMARY REGISTRATION OPTIONS: CLEAR SEPARATION FOR STUDENTS VS REPS */}
      <div className="bg-gradient-to-b from-slate-50 to-white border-2 border-indigo-100 rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            {lang === 'ar' ? 'بوابة التسجيل والمشاركة الرسمية' : 'Official Registration Portals'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950">
            {lang === 'ar' ? 'حدد مسار تسجيلك في تحدي التطبيقات 2026' : 'Choose Your Registration Pathway'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            {lang === 'ar'
              ? 'يرجى اختيار المسار المناسب لك بدقة لضمان تسجيل المدرسة أو الانضمام للفريق الصحيح.'
              : 'Please choose the appropriate pathway based on whether you are representing a school or an invited student.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* OPTION 1: REGISTER YOUR SCHOOL (For School Representatives) */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 hover:border-indigo-400 p-6 flex flex-col justify-between transition-all hover:shadow-lg relative overflow-hidden group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                  {lang === 'ar' ? 'الخيار 1' : 'Option 1'}
                </span>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 flex items-center gap-1">
                  <School className="w-3.5 h-3.5" />
                  {lang === 'ar' ? 'لممثلي المدارس' : 'For School Representatives'}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-900 transition-colors">
                  {lang === 'ar' ? 'تسجيل المدرسة (Register Your School)' : 'Register Your School'}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {lang === 'ar'
                    ? 'مخصص لمدراء المدارس، مشرفي الحاسوب وتكنولوجيا التعليم، وممثلي المدارس الرسميين.'
                    : 'For School Principals, STEM Coordinators, and authorized School Representatives.'}
                </p>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {lang === 'ar'
                  ? 'سجّل مدرستك لتأهيل طلابك للمشاركة في المسابقة، وإنشاء الفرق الرسمية، وتوليد رموز الانضمام للطلاب.'
                  : 'Register your educational institution to participate in App Challenge 2026, set up official teams, and generate student invitation codes.'}
              </p>

              <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600 space-y-1.5 border border-slate-150">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>{lang === 'ar' ? 'اعتماد المدرسة من إدارة المسابقة' : 'Official school verification'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>{lang === 'ar' ? 'إنشاء حتى 3 فرق لكل مدرسة' : 'Manage up to 3 official teams'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>{lang === 'ar' ? 'توليد رموز الانضمام وروابط الدعوة' : 'Generate team codes & invite links'}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="mt-6 w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <School className="w-4 h-4 text-indigo-300" />
              <span>{lang === 'ar' ? 'تسجيل المدرسة' : 'Register Your School'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* OPTION 2: JOIN YOUR SCHOOL TEAM (For Students) */}
          <div className="bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/40 rounded-2xl border-2 border-emerald-400 hover:border-emerald-500 p-6 flex flex-col justify-between transition-all shadow-md hover:shadow-xl relative overflow-hidden ring-4 ring-emerald-500/10 group">
            {/* Prominent Student Badge */}
            <div className="absolute -top-1 -end-1 bg-gradient-to-l from-emerald-600 to-teal-600 text-white text-[10px] font-black uppercase tracking-wider py-1 px-4 rounded-bl-xl shadow-sm">
              {lang === 'ar' ? 'للطلاب: اضغط هنا للانضمام' : 'For Students · Select Here'}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  {lang === 'ar' ? 'الخيار 2 (للطلاب)' : 'Option 2 (Students)'}
                </span>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100/70 px-2.5 py-1 rounded-lg border border-emerald-300 flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5" />
                  {lang === 'ar' ? 'للطلاب المشاركين' : 'For Participating Students'}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900 group-hover:text-emerald-950 transition-colors flex items-center gap-2">
                  <span>{lang === 'ar' ? 'الانضمام لفريق مدرستك (Join Your School Team)' : 'Join Your School Team'}</span>
                </h3>
                <p className="text-xs text-emerald-800 font-bold mt-1">
                  {lang === 'ar'
                    ? 'للطلاب الذين تشارك مدرستهم بالفعل في مسابقة تحدي التطبيقات 2026.'
                    : 'For Students whose school is already participating in App Challenge.'}
                </p>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {lang === 'ar'
                  ? 'هل تشارك مدرستك بالفعل؟ أدخل رمز الفريق (Team Code) المزود لك من معلمك أو اضغط رابط الدعوة للانضمام مباشرة لفريق مدرستك.'
                  : 'Is your school already participating? Enter the Team Code provided by your teacher or school representative to join your team.'}
              </p>

              <div className="bg-emerald-50/80 rounded-xl p-3 text-xs text-emerald-950 space-y-1.5 border border-emerald-200">
                <div className="flex items-center gap-2 font-medium">
                  <KeyRound className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{lang === 'ar' ? 'تحديد تلقائي: المسابقة ← المدرسة ← الفريق' : 'Auto-resolves Competition → School → Team'}</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{lang === 'ar' ? 'لا حاجة لاختيار المدرسة يدوياً (محمية ومؤكدة)' : 'No manual school search needed (Locked & verified)'}</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{lang === 'ar' ? 'ربط فوري بحساب LMS ولوحة تحكم الطالب' : 'Instant LMS account link & Student Dashboard access'}</span>
                </div>
              </div>

              {/* Sample Quick Team Code Chip */}
              <div className="flex items-center justify-between text-[11px] bg-white p-2 rounded-lg border border-emerald-200">
                <span className="text-slate-600">{lang === 'ar' ? 'رمز تجريبي:' : 'Demo Code:'} <strong className="font-mono text-emerald-700">APP26-PX73K</strong></span>
                <button
                  type="button"
                  onClick={() => handleOpenJoinWithCode('APP26-PX73K')}
                  className="text-emerald-700 hover:text-emerald-900 font-bold underline cursor-pointer"
                >
                  {lang === 'ar' ? 'تجربة انضمام Pixel Heroes' : 'Test Pixel Heroes Join'}
                </button>
              </div>
            </div>

            <button
              onClick={() => handleOpenJoinWithCode('APP26-PX73K')}
              className="mt-6 w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer border border-emerald-400/40"
            >
              <GraduationCap className="w-5 h-5 text-emerald-100" />
              <span>{lang === 'ar' ? 'انضم لفريق مدرستك الآن' : 'Join Your School Team'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Important Dates Timeline */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <span>{lang === 'ar' ? 'الجدول الزمني ومواعيد المراحل الرئيسية' : 'Official Competition Timeline'}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {lang === 'ar' ? 'تتحكم هذه المواعيد تلقائياً بإتاحة التسجيل والتسليم والتقييم' : 'Automated schedule governing phase transitions and submission locks'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
            <span className="text-[11px] font-bold text-blue-700 uppercase">
              {lang === 'ar' ? '1. فترة التسجيل' : '1. School & Team Registration'}
            </span>
            <p className="font-bold text-sm text-slate-900 mt-1">
              {competition.registrationStartDate} → {competition.registrationEndDate}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {lang === 'ar' ? 'تسجيل المدارس وإنشاء الفرق عبر الرموز' : 'School approval & student team invites'}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
            <span className="text-[11px] font-bold text-indigo-700 uppercase">
              {lang === 'ar' ? '2. تدريب LMS المكثف' : '2. LMS Training Phase'}
            </span>
            <p className="font-bold text-sm text-slate-900 mt-1">
              {competition.trainingStartDate} → {competition.trainingEndDate}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {lang === 'ar' ? '7 أيام تدريبية على تصميم وبرمجة الألعاب' : '7-day intensive bootcamp & sessions'}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
            <span className="text-[11px] font-bold text-purple-700 uppercase">
              {lang === 'ar' ? '3. التطوير والموعد النهائي' : '3. Game Dev & Submission'}
            </span>
            <p className="font-bold text-sm text-slate-900 mt-1">
              {competition.developmentStartDate} → {competition.submissionDeadline}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {lang === 'ar' ? 'بناء اللعبة وتسليم النسخة القابلة للعب' : 'Build release & documentation upload'}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
            <span className="text-[11px] font-bold text-amber-700 uppercase">
              {lang === 'ar' ? '4. التحكيم وإعلان النتائج' : '4. Evaluation & Results'}
            </span>
            <p className="font-bold text-sm text-slate-900 mt-1">
              {competition.evaluationStartDate} → {competition.resultsAnnouncementDate}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {lang === 'ar' ? 'تقييم المحكمين وإعلان الفائزين' : 'Jury scoring & public winner crowning'}
            </p>
          </div>
        </div>
      </div>

      {/* Rules & Requirements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-indigo-700 font-bold text-base">
            <ShieldCheck className="w-5 h-5" />
            <h3>{lang === 'ar' ? 'شروط وأحكام المسابقة' : 'Competition Rules & Eligibility'}</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
            {lang === 'ar' ? competition.rulesAr : competition.rulesEn}
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-blue-700 font-bold text-base">
            <FileText className="w-5 h-5" />
            <h3>{lang === 'ar' ? 'متطلبات تسليم اللعبة' : 'Game Submission Requirements'}</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {lang === 'ar' ? competition.submissionRequirementsAr : competition.submissionRequirementsEn}
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs pt-2">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-150">
              <span className="font-bold text-slate-900 block">🎮 Playable Build</span>
              <span className="text-slate-500 text-[11px]">APK, ZIP, EXE or Web URL</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-150">
              <span className="font-bold text-slate-900 block">📑 Game Design Doc</span>
              <span className="text-slate-500 text-[11px]">GDD PDF detailing mechanics</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-150">
              <span className="font-bold text-slate-900 block">🎥 Gameplay Video</span>
              <span className="text-slate-500 text-[11px]">2-minute uncut showcase</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-150">
              <span className="font-bold text-slate-900 block">📊 Pitch Deck</span>
              <span className="text-slate-500 text-[11px]">Slide deck for jury review</span>
            </div>
          </div>
        </div>
      </div>

      {/* FAQs Accordion */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-extrabold text-slate-900">
            {lang === 'ar' ? 'الأسئلة الشائعة (FAQs)' : 'Frequently Asked Questions'}
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-slate-200 rounded-xl overflow-hidden transition-colors"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full text-start p-4 text-xs sm:text-sm font-bold text-slate-900 bg-slate-50/70 hover:bg-slate-50 flex items-center justify-between cursor-pointer"
              >
                <span>{lang === 'ar' ? faq.qAr : faq.qEn}</span>
                <span className="text-slate-400 ms-2">{openFaq === idx ? '−' : '+'}</span>
              </button>
              {openFaq === idx && (
                <div className="p-4 bg-white text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200">
                  {lang === 'ar' ? faq.aAr : faq.aEn}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* School Registration Modal */}
      <SchoolRegistrationModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
      />

      {/* Student Join Team Flow Modal */}
      <JoinTeamFlowModal
        isOpen={isJoinTeamModalOpen}
        initialCode={joinTeamCode}
        onClose={() => {
          setIsJoinTeamModalOpen(false);
          setJoinTeamCode('');
        }}
        onNavigateToTeam={(teamId) => {
          if (onNavigateToTeam) {
            onNavigateToTeam(teamId);
          }
        }}
        onNavigateToDashboard={() => {
          setRole('student');
        }}
      />
    </div>
  );
};

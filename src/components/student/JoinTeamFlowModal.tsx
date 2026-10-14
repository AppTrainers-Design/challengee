import React, { useState, useEffect } from 'react';
import { useCompetition, TeamValidationResult } from '../../context/CompetitionContext';
import {
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  School,
  Trophy,
  UserCheck,
  UserPlus,
  LogIn,
  KeyRound,
  Sparkles,
  X,
  ExternalLink,
  Lock,
  User,
  Mail,
  Phone,
  Calendar,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface JoinTeamFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode?: string;
  onNavigateToTeam?: (teamId: string) => void;
  onNavigateToDashboard?: () => void;
}

type FlowStep = 'enter_code' | 'verify_team' | 'auth_check' | 'login' | 'register' | 'confirm' | 'success';

export const JoinTeamFlowModal: React.FC<JoinTeamFlowModalProps> = ({
  isOpen,
  onClose,
  initialCode = '',
  onNavigateToTeam,
  onNavigateToDashboard,
}) => {
  const {
    lang,
    role,
    setRole,
    students,
    activePersonaId,
    setActivePersonaId,
    validateTeamCode,
    loginStudentAndJoinTeam,
    registerStudentAndJoinTeam,
  } = useCompetition();

  const [step, setStep] = useState<FlowStep>('enter_code');
  const [teamCodeInput, setTeamCodeInput] = useState<string>(initialCode || '');
  const [validationResult, setValidationResult] = useState<TeamValidationResult | null>(null);
  const [searchedCode, setSearchedCode] = useState<string>('');

  // Selected student for existing account login
  const [selectedExistingStudentId, setSelectedExistingStudentId] = useState<string>('std-dema');
  const [loginEmail, setLoginEmail] = useState<string>('demahamdanacsii5@gmail.com');
  const [loginPassword, setLoginPassword] = useState<string>('••••••••');

  // Registration Form State
  const [regForm, setRegForm] = useState({
    fullName: 'Dema Hamdan',
    email: 'demahamdanacsii5@gmail.com',
    mobile: '+962 7 9876 5432',
    password: 'Password123!',
    confirmPassword: 'Password123!',
    dateOfBirth: '2009-10-12',
    age: 16,
    gender: 'female' as 'male' | 'female',
    nationality: 'Jordanian',
    nationalId: '9099887766',
    grade: 'Grade 11',
    guardianName: 'Dr. Tariq Hamdan',
    guardianMobile: '+962 7 9888 1122',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [joinedResult, setJoinedResult] = useState<{
    teamName: string;
    schoolName: string;
    memberCount: number;
    teamId: string;
    studentName: string;
  } | null>(null);

  // Auto-handle initialCode if passed
  useEffect(() => {
    if (initialCode) {
      setTeamCodeInput(initialCode);
      const res = validateTeamCode(initialCode, role === 'student' ? activePersonaId : undefined);
      setValidationResult(res);
      setSearchedCode(initialCode);
      if (res.valid) {
        setStep('verify_team');
      }
    } else {
      setTeamCodeInput('');
      setValidationResult(null);
      setStep('enter_code');
    }
  }, [initialCode, isOpen]);

  if (!isOpen) return null;

  const handleSearchCode = (codeToSearch?: string) => {
    const code = (codeToSearch || teamCodeInput).trim().toUpperCase();
    if (!code) {
      setValidationResult({
        valid: false,
        errorType: 'invalid_code',
        errorMessageEn: 'Please enter a valid Team Code.',
        errorMessageAr: 'يرجى إدخال رمز الفريق للمتابعة.',
      });
      return;
    }

    setSearchedCode(code);
    const currentStudentId = role === 'student' ? activePersonaId : undefined;
    const res = validateTeamCode(code, currentStudentId);
    setValidationResult(res);

    if (res.valid) {
      setStep('verify_team');
    }
  };

  const handleProceedFromTeamCard = () => {
    if (!validationResult?.valid || !validationResult.team) return;

    // Check whether student is already logged in
    if (role === 'student') {
      // Check if logged in student is already in a team
      const currentStd = students.find((s) => s.id === activePersonaId);
      if (currentStd?.teamId) {
        // Already in a team
        setValidationResult({
          valid: false,
          errorType: 'already_in_team',
          errorMessageEn: `You are already registered with team "${validationResult.team.teamName}".`,
          errorMessageAr: `أنت مسجل بالفعل في فريق "${validationResult.team.teamName}".`,
        });
        return;
      }
      // Logged in and free to join
      setStep('confirm');
    } else {
      // Not logged in as student -> ask for login or account creation
      setStep('auth_check');
    }
  };

  const handleConfirmExistingLogin = () => {
    if (!validationResult?.team) return;
    const res = loginStudentAndJoinTeam(selectedExistingStudentId, validationResult.team.teamCode);
    if (res.success && res.team && res.student) {
      setJoinedResult({
        teamName: res.team.teamName,
        schoolName: validationResult.school?.nameEn || 'Al-Nahda School',
        memberCount: res.team.memberIds.length,
        teamId: res.team.id,
        studentName: res.student.fullName,
      });
      setStep('success');
    } else {
      alert(res.message);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validationResult?.team) return;

    const errors: Record<string, string> = {};
    if (!regForm.fullName.trim()) errors.fullName = 'Full name is required';
    if (!regForm.email.trim()) errors.email = 'Email is required';
    if (!regForm.password || regForm.password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (regForm.password !== regForm.confirmPassword) errors.confirmPassword = 'Passwords do not match';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});

    const res = registerStudentAndJoinTeam(
      {
        fullName: regForm.fullName,
        email: regForm.email,
        mobile: regForm.mobile,
        dateOfBirth: regForm.dateOfBirth,
        age: Number(regForm.age) || 16,
        gender: regForm.gender,
        nationality: regForm.nationality,
        nationalId: regForm.nationalId,
        schoolId: validationResult.team.schoolId,
        grade: regForm.grade,
        guardianName: regForm.guardianName,
        guardianMobile: regForm.guardianMobile,
      },
      validationResult.team.teamCode
    );

    if (res.success && res.team && res.student) {
      setJoinedResult({
        teamName: res.team.teamName,
        schoolName: validationResult.school?.nameEn || 'Al-Nahda School',
        memberCount: res.team.memberIds.length,
        teamId: res.team.id,
        studentName: res.student.fullName,
      });
      setStep('success');
    } else {
      alert(res.message);
    }
  };

  const handleFinalConfirmJoin = () => {
    if (!validationResult?.team) return;
    const stdId = activePersonaId || 'std-dema';
    const res = loginStudentAndJoinTeam(stdId, validationResult.team.teamCode);
    if (res.success && res.team && res.student) {
      setJoinedResult({
        teamName: res.team.teamName,
        schoolName: validationResult.school?.nameEn || 'Al-Nahda School',
        memberCount: res.team.memberIds.length,
        teamId: res.team.id,
        studentName: res.student.fullName,
      });
      setStep('success');
    } else {
      alert(res.message);
    }
  };

  // Resolve team members to show in confirmation card
  const teamMembersList = validationResult?.team
    ? validationResult.team.memberIds
        .map((id) => students.find((s) => s.id === id))
        .filter(Boolean)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-6"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white px-6 py-5 flex items-center justify-between border-b border-indigo-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/50 border border-indigo-400/30 flex items-center justify-center text-indigo-200">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                  {lang === 'ar' ? 'مسار انضمام الطلاب' : 'Student Joining Flow'}
                </span>
                <span className="text-indigo-400">·</span>
                <span className="text-xs text-indigo-200 font-medium">
                  {lang === 'ar' ? 'تحدي التطبيقات 2026' : 'App Challenge 2026'}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white">
                {step === 'enter_code' && (lang === 'ar' ? 'انضم إلى فريق مدرستك' : 'Join Your School Team')}
                {step === 'verify_team' && (lang === 'ar' ? 'تأكيد بيانات الفريق' : 'Verify Team Details')}
                {step === 'auth_check' && (lang === 'ar' ? 'تسجيل الدخول أو إنشاء حساب' : 'Student Authentication')}
                {step === 'login' && (lang === 'ar' ? 'تسجيل الدخول بحساب LMS' : 'LMS Student Login')}
                {step === 'register' && (lang === 'ar' ? 'إنشاء حساب طالب جديد' : 'Create Student Account')}
                {step === 'confirm' && (lang === 'ar' ? 'تأكيد الانضمام للفريق' : 'Confirm Team Joining')}
                {step === 'success' && (lang === 'ar' ? 'تم الانضمام بنجاح!' : 'Successfully Joined!')}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between text-xs font-medium text-slate-500">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                step === 'enter_code'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {step !== 'enter_code' ? '✓' : '1'}
            </span>
            <span className={step === 'enter_code' ? 'text-indigo-900 font-semibold' : ''}>
              {lang === 'ar' ? 'رمز الفريق' : 'Team Code'}
            </span>
          </div>

          <span className="text-slate-300">→</span>

          <div className="flex items-center gap-1.5">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                step === 'verify_team'
                  ? 'bg-indigo-600 text-white'
                  : ['auth_check', 'login', 'register', 'confirm', 'success'].includes(step)
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {['auth_check', 'login', 'register', 'confirm', 'success'].includes(step) ? '✓' : '2'}
            </span>
            <span className={step === 'verify_team' ? 'text-indigo-900 font-semibold' : ''}>
              {lang === 'ar' ? 'التحقق' : 'Verify'}
            </span>
          </div>

          <span className="text-slate-300">→</span>

          <div className="flex items-center gap-1.5">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                ['auth_check', 'login', 'register'].includes(step)
                  ? 'bg-indigo-600 text-white'
                  : ['confirm', 'success'].includes(step)
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {['confirm', 'success'].includes(step) ? '✓' : '3'}
            </span>
            <span className={['auth_check', 'login', 'register'].includes(step) ? 'text-indigo-900 font-semibold' : ''}>
              {lang === 'ar' ? 'حساب الطالب' : 'Account'}
            </span>
          </div>

          <span className="text-slate-300">→</span>

          <div className="flex items-center gap-1.5">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                step === 'confirm'
                  ? 'bg-indigo-600 text-white'
                  : step === 'success'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {step === 'success' ? '✓' : '4'}
            </span>
            <span className={step === 'confirm' || step === 'success' ? 'text-indigo-900 font-semibold' : ''}>
              {lang === 'ar' ? 'الانضمام' : 'Join'}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* STEP 1: ENTER CODE */}
            {step === 'enter_code' && (
              <motion.div
                key="enter_code"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-4 text-indigo-950">
                  <p className="text-sm leading-relaxed font-medium">
                    {lang === 'ar'
                      ? 'هل تشارك مدرستك بالفعل في تحدي التطبيقات 2026؟ أدخل رمز الفريق المزود لك من قبل ممثل مدرستك أو معلمك للانضمام مباشرة إلى الفريق المعتمد.'
                      : 'Is your school already participating in App Challenge? Enter the Team Code provided by your school representative or teacher to join the official team.'}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    {lang === 'ar' ? 'رمز الفريق (Team Code)' : 'Team Code'}
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={teamCodeInput}
                      onChange={(e) => setTeamCodeInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchCode()}
                      placeholder="e.g. APP26-PX73K"
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-300 rounded-xl font-mono text-base font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all uppercase tracking-wider"
                    />
                    {teamCodeInput && (
                      <button
                        onClick={() => setTeamCodeInput('')}
                        className="absolute end-3 text-slate-400 hover:text-slate-600 text-xs px-2 py-1 rounded cursor-pointer"
                      >
                        {lang === 'ar' ? 'مسح' : 'Clear'}
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    {lang === 'ar'
                      ? 'يحدد رمز الفريق تلقائياً: المسابقة ← المدرسة ← الفريق.'
                      : 'The Team Code automatically identifies: Competition → School → Team.'}
                  </p>
                </div>

                {/* Validation Error Banner if any */}
                {validationResult && !validationResult.valid && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 flex items-start gap-3 text-rose-800 text-sm">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold">
                        {validationResult.errorType === 'team_full'
                          ? (lang === 'ar' ? 'الفريق مكتمل' : 'Team Is Full')
                          : validationResult.errorType === 'school_unapproved'
                          ? (lang === 'ar' ? 'المدرسة قيد الاعتماد' : 'School Approval Pending')
                          : validationResult.errorType === 'already_in_team'
                          ? (lang === 'ar' ? 'مسجل بالفعل في فريق' : 'Already in a Team')
                          : validationResult.errorType === 'team_unavailable'
                          ? (lang === 'ar' ? 'الفريق غير متاح' : 'Team Unavailable')
                          : (lang === 'ar' ? 'رمز الفريق غير صحيح' : 'Invalid Team Code')}
                      </div>
                      <p className="text-xs text-rose-700 mt-0.5">
                        {lang === 'ar' ? validationResult.errorMessageAr : validationResult.errorMessageEn}
                      </p>
                    </div>
                  </div>
                )}

                {/* Prototype Quick Test Chips */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="font-semibold flex items-center gap-1.5 text-slate-800">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      {lang === 'ar' ? 'أكواد تجريبية سريعة لاختبار النموذج:' : 'Demo Quick-Fill Codes for Testing:'}
                    </span>
                    <span className="text-[11px] text-indigo-600 font-medium">Click to test</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setTeamCodeInput('APP26-PX73K');
                        handleSearchCode('APP26-PX73K');
                      }}
                      className="p-2.5 text-start bg-white hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 rounded-lg transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-indigo-700">APP26-PX73K</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-semibold">
                          3/5 {lang === 'ar' ? 'أعضاء' : 'Members'}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-slate-800 mt-1">Pixel Heroes</div>
                      <div className="text-[11px] text-slate-500">Al-Nahda Modern School (Open)</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setTeamCodeInput('APP26-GM88R');
                        handleSearchCode('APP26-GM88R');
                      }}
                      className="p-2.5 text-start bg-white hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 rounded-lg transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-indigo-700">APP26-GM88R</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-semibold">
                          3/5 {lang === 'ar' ? 'أعضاء' : 'Members'}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-slate-800 mt-1">Game Makers</div>
                      <div className="text-[11px] text-slate-500">Al-Nahda Modern School (Open)</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setTeamCodeInput('APP26-FULL5');
                        handleSearchCode('APP26-FULL5');
                      }}
                      className="p-2.5 text-start bg-white hover:bg-rose-50/50 border border-slate-200 hover:border-rose-300 rounded-lg transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-slate-700">APP26-FULL5</span>
                        <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-semibold">
                          5/5 {lang === 'ar' ? 'مكتمل' : 'Full'}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-slate-800 mt-1">Cyber Titans (Full Demo)</div>
                      <div className="text-[11px] text-slate-500">Tests 5/5 max capacity error</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setTeamCodeInput('APP26-LOCK7');
                        handleSearchCode('APP26-LOCK7');
                      }}
                      className="p-2.5 text-start bg-white hover:bg-amber-50/50 border border-slate-200 hover:border-amber-300 rounded-lg transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-slate-700">APP26-LOCK7</span>
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-semibold">
                          {lang === 'ar' ? 'مغلق' : 'Withdrawn'}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-slate-800 mt-1">Solar Flare (Locked Demo)</div>
                      <div className="text-[11px] text-slate-500">Tests unavailable team error</div>
                    </button>
                  </div>
                </div>

                {/* Direct Invitation Link Information */}
                <div className="border-t border-slate-200 pt-4 flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
                    <span>
                      {lang === 'ar'
                        ? 'هل استلمت رابط دعوة مباشر؟'
                        : 'Received a direct invitation link?'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setTeamCodeInput('APP26-PX73K');
                      handleSearchCode('APP26-PX73K');
                    }}
                    className="text-indigo-600 hover:text-indigo-800 font-semibold underline cursor-pointer"
                  >
                    {lang === 'ar' ? 'تجربة رابط دعوة Pixel Heroes' : 'Simulate /app-challenge/join/APP26-PX73K'}
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-medium transition-colors cursor-pointer"
                  >
                    {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSearchCode()}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md hover:shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>{lang === 'ar' ? 'البحث عن الفريق' : 'Find Team'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: VERIFY TEAM DETAILS */}
            {step === 'verify_team' && validationResult?.team && (
              <motion.div
                key="verify_team"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-5"
              >
                <div className="text-center pb-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {lang === 'ar' ? 'تم التعرف على الفريق بنجاح' : 'Team Identified Automatically'}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900">
                    {lang === 'ar' ? 'تأكيد بيانات الفريق' : 'Confirm Team Details'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {lang === 'ar'
                      ? 'تم تحديد المسابقة والمدرسة والفريق بناءً على رمز الدعوة الخاص بك.'
                      : 'The Team Code has automatically resolved your competition, school, and team.'}
                  </p>
                </div>

                {/* Team Card Box */}
                <div className="bg-gradient-to-br from-indigo-50/80 via-white to-slate-50 border-2 border-indigo-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex items-start justify-between border-b border-indigo-100 pb-3">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                        {lang === 'ar' ? 'فريق معتمد' : 'Verified Official Team'}
                      </span>
                      <h4 className="text-xl font-black text-slate-900 mt-0.5">
                        {validationResult.team.teamName}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1">
                        {validationResult.team.description}
                      </p>
                    </div>

                    <div className="text-end">
                      <span className="font-mono text-xs font-black bg-indigo-900 text-white px-2.5 py-1 rounded-lg">
                        {validationResult.team.teamCode}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-white/90 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block mb-0.5">
                        {lang === 'ar' ? 'المدرسة المعتمدة' : 'School'}
                      </span>
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <School className="w-3.5 h-3.5 text-indigo-600" />
                        {validationResult.school?.nameEn || 'Al-Nahda School'}
                      </span>
                    </div>

                    <div className="bg-white/90 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block mb-0.5">
                        {lang === 'ar' ? 'المسابقة' : 'Competition'}
                      </span>
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <Trophy className="w-3.5 h-3.5 text-amber-500" />
                        App Challenge 2026
                      </span>
                    </div>

                    <div className="bg-white/90 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block mb-0.5">
                        {lang === 'ar' ? 'حالة الانضمام' : 'Status'}
                      </span>
                      <span className="font-bold text-emerald-700 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        {lang === 'ar' ? 'متاح للانضمام' : 'Open for Members'}
                      </span>
                    </div>

                    <div className="bg-white/90 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block mb-0.5">
                        {lang === 'ar' ? 'الأعضاء الحاليين' : 'Current Capacity'}
                      </span>
                      <span className="font-bold text-indigo-900">
                        {validationResult.team.memberIds.length} / 5 {lang === 'ar' ? 'طلاب' : 'Students'}
                      </span>
                    </div>
                  </div>

                  {/* Current Team Members Roster */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-indigo-600" />
                        {lang === 'ar' ? 'أعضاء الفريق المسجلون حالياً:' : 'Current Team Roster:'}
                      </span>
                      <span className="text-[11px] text-slate-500 font-normal">
                        ({validationResult.team.memberIds.length} of 5 slots filled)
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {teamMembersList.map((st, idx) => (
                        <div
                          key={st?.id || idx}
                          className="flex items-center justify-between text-xs bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="font-medium text-slate-800">{st?.fullName}</span>
                          </div>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                              st?.isLeader
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {st?.isLeader ? (lang === 'ar' ? 'قائد الفريق' : 'Team Leader') : (lang === 'ar' ? 'عضو' : 'Member')}
                          </span>
                        </div>
                      ))}

                      {/* Remaining Slot placeholder */}
                      <div className="flex items-center justify-between text-xs bg-dashed border-2 border-dashed border-indigo-200 px-2.5 py-1.5 rounded-lg text-indigo-700">
                        <span className="font-semibold flex items-center gap-1.5">
                          <UserPlus className="w-3.5 h-3.5" />
                          {lang === 'ar' ? 'مقعدك في الفريق (أنت)' : 'Your Spot (You)'}
                        </span>
                        <span className="text-[10px] font-bold text-indigo-600 uppercase">
                          {lang === 'ar' ? 'شاغر' : 'Available'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      {lang === 'ar'
                        ? 'ملاحظة: لا حاجة لإعادة اختيار المدرسة أو المسابقة يدوياً؛ الرمز يربطك مباشرة بفريق مدرستك الرسمي.'
                        : 'Note: You do not need to choose your school or competition manually; the code securely links you to your verified school team.'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('enter_code')}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>{lang === 'ar' ? 'تغيير الرمز' : 'Change Code'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleProceedFromTeamCard}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md hover:shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>{lang === 'ar' ? 'الانضمام لهذا الفريق' : 'Join This Team'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: AUTH CHECK (If not logged in as student) */}
            {step === 'auth_check' && validationResult?.team && (
              <motion.div
                key="auth_check"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 mx-auto flex items-center justify-center mb-3">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {lang === 'ar' ? 'تسجيل الدخول أو إنشاء حساب طالب' : 'Student Authentication Required'}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
                    {lang === 'ar'
                      ? `للانضمام إلى فريق "${validationResult.team.teamName}"، يرجى تسجيل الدخول بحسابك في منصة LMS أو إنشاء حساب طالب جديد.`
                      : `To join team "${validationResult.team.teamName}", please log in or create a student account.`}
                  </p>
                </div>

                {/* Team context reminder */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between text-xs">
                  <span className="text-slate-600">
                    {lang === 'ar' ? 'الفريق المستهدف:' : 'Joining Team:'}
                    <strong className="text-slate-900 ms-1">{validationResult.team.teamName}</strong>
                  </span>
                  <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    {validationResult.team.teamCode}
                  </span>
                </div>

                {/* Two Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Option 1: Existing LMS Account */}
                  <div className="bg-white border-2 border-indigo-200 hover:border-indigo-500 rounded-2xl p-5 flex flex-col justify-between transition-all hover:shadow-lg group">
                    <div className="space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <LogIn className="w-5 h-5" />
                      </div>
                      <h4 className="text-base font-bold text-slate-900">
                        {lang === 'ar' ? 'حساب طالب مسجل مسبقاً' : 'Existing Student Account'}
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {lang === 'ar'
                          ? 'إذا كان لديك حساب LMS مسجل، سجل دخولك وسيعيدك النظام تلقائياً لإتمام الانضمام للفريق دون فقدان الرمز.'
                          : 'If you already have an LMS account, log in. You will return automatically to this team invitation.'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setStep('login')}
                      className="mt-5 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>{lang === 'ar' ? 'تسجيل الدخول ومتابعة الانضمام' : 'Login with LMS Account'}</span>
                    </button>
                  </div>

                  {/* Option 2: New Student Account */}
                  <div className="bg-white border-2 border-emerald-200 hover:border-emerald-500 rounded-2xl p-5 flex flex-col justify-between transition-all hover:shadow-lg group">
                    <div className="space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <UserPlus className="w-5 h-5" />
                      </div>
                      <h4 className="text-base font-bold text-slate-900">
                        {lang === 'ar' ? 'طالب جديد (إنشاء حساب)' : 'Create Student Account'}
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {lang === 'ar'
                          ? 'ليس لديك حساب بعد؟ سجّل كطالب جديد؛ المدرسة والفريق محددين تلقائياً دون الحاجة للبحث مجدداً.'
                          : 'No account yet? Register as a student. School and Team are auto-assigned so you won’t have to search again.'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setStep('register')}
                      className="mt-5 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>{lang === 'ar' ? 'إنشاء حساب طالب جديد' : 'Create Student Account'}</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-start pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('verify_team')}
                    className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'الرجوع إلى تفاصيل الفريق' : 'Back to Team Details'}</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3A: LOGIN WITH EXISTING STUDENT ACCOUNT */}
            {step === 'login' && validationResult?.team && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-5"
              >
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {lang === 'ar' ? 'تسجيل الدخول بحساب LMS الحالي' : 'Login with Existing Student LMS Account'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {lang === 'ar'
                      ? 'بعد تسجيل الدخول، ستتم إعادتك تلقائياً لإتمام الانضمام إلى فريق ' + validationResult.team.teamName
                      : `After login, you will automatically return to complete joining ${validationResult.team.teamName}.`}
                  </p>
                </div>

                {/* Account Selector for Seamless Prototype Testing */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                    <span>{lang === 'ar' ? 'اختر حساب طالب مسجل في النظام للاختبار السريع:' : 'Select LMS Student Account for Instant Demo:'}</span>
                    <span className="text-[11px] text-indigo-600 font-medium">1-Click Auth</span>
                  </div>

                  <div className="space-y-2">
                    {/* Dema Hamdan */}
                    <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedExistingStudentId === 'std-dema'
                        ? 'bg-indigo-50 border-indigo-500 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}>
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="existing_student"
                          checked={selectedExistingStudentId === 'std-dema'}
                          onChange={() => {
                            setSelectedExistingStudentId('std-dema');
                            setLoginEmail('demahamdanacsii5@gmail.com');
                          }}
                          className="text-indigo-600"
                        />
                        <div>
                          <div className="font-bold text-xs text-slate-900">Dema Hamdan (ديما حمدان)</div>
                          <div className="text-[11px] text-slate-500">demahamdanacsii5@gmail.com · Grade 11 · Al-Nahda School</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                        {lang === 'ar' ? 'جاهزة للانضمام' : 'Ready to Join'}
                      </span>
                    </label>

                    {/* Noor Salem */}
                    <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedExistingStudentId === 'std-noor'
                        ? 'bg-indigo-50 border-indigo-500 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}>
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="existing_student"
                          checked={selectedExistingStudentId === 'std-noor'}
                          onChange={() => {
                            setSelectedExistingStudentId('std-noor');
                            setLoginEmail('noor.salem@student.alnahda.edu');
                          }}
                          className="text-indigo-600"
                        />
                        <div>
                          <div className="font-bold text-xs text-slate-900">Noor Salem (نور سالم)</div>
                          <div className="text-[11px] text-slate-500">noor.salem@student.alnahda.edu · Grade 11 · Al-Nahda School</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {lang === 'ar' ? 'طالب مسجل' : 'Registered Student'}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Email / Password preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">
                      {lang === 'ar' ? 'البريد الإلكتروني' : 'Student Email'}
                    </label>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">
                      {lang === 'ar' ? 'كلمة المرور' : 'Password'}
                    </label>
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium text-xs"
                    />
                  </div>
                </div>

                {/* Context alert */}
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-xs text-indigo-900 flex items-start gap-2">
                  <KeyRound className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>
                    {lang === 'ar'
                      ? 'الرمز محفوظ بأمان: بعد تسجيل الدخول ستنتقل مباشرة لخطوة تأكيد الانضمام لفريق ' + validationResult.team.teamName
                      : `State preserved: Upon logging in, you will be redirected straight to confirm joining ${validationResult.team.teamName}.`}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('auth_check')}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-medium cursor-pointer"
                  >
                    {lang === 'ar' ? 'رجوع' : 'Back'}
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmExistingLogin}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{lang === 'ar' ? 'تسجيل الدخول والانضمام للفريق' : 'Login & Join Team'}</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3B: CREATE STUDENT ACCOUNT */}
            {step === 'register' && validationResult?.team && (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {lang === 'ar' ? 'إنشاء حساب طالب جديد في منصة LMS' : 'Create Student Account'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {lang === 'ar'
                      ? 'أدخل بياناتك الشخصية لإتمام التسجيل والانضمام التلقائي لفريقك.'
                      : 'Fill in your profile details to register and automatically join your school team.'}
                  </p>
                </div>

                {/* Read-Only Pre-Identified Information */}
                <div className="bg-slate-100 border border-slate-300 rounded-xl p-3.5 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block font-medium">
                      {lang === 'ar' ? 'المدرسة (محددة تلقائياً بواسطة الرمز):' : 'School (Auto-identified by Team Code):'}
                    </span>
                    <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                      <School className="w-3.5 h-3.5 text-indigo-600" />
                      {validationResult.school?.nameEn || 'Al-Nahda School'}
                      <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded ms-1">
                        {lang === 'ar' ? 'للقراءة فقط' : 'Read-only'}
                      </span>
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block font-medium">
                      {lang === 'ar' ? 'الفريق المنضم إليه:' : 'Joining Team:'}
                    </span>
                    <span className="font-bold text-indigo-900 flex items-center gap-1 mt-0.5">
                      <Users className="w-3.5 h-3.5 text-indigo-600" />
                      {validationResult.team.teamName}
                      <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded ms-1 font-mono">
                        {validationResult.team.teamCode}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Form Fields */}
                <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">
                        {lang === 'ar' ? 'الاسم الكامل للطالب *' : 'Full Name *'}
                      </label>
                      <div className="relative">
                        <User className="w-3.5 h-3.5 text-slate-400 absolute start-2.5 top-2.5" />
                        <input
                          type="text"
                          required
                          value={regForm.fullName}
                          onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })}
                          className="w-full ps-8 pe-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                          placeholder="e.g. Dema Hamdan"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 mb-1">
                        {lang === 'ar' ? 'البريد الإلكتروني *' : 'Email Address *'}
                      </label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 text-slate-400 absolute start-2.5 top-2.5" />
                        <input
                          type="email"
                          required
                          value={regForm.email}
                          onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                          className="w-full ps-8 pe-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                          placeholder="student@school.edu"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">
                        {lang === 'ar' ? 'رقم الهاتف *' : 'Mobile Phone *'}
                      </label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 text-slate-400 absolute start-2.5 top-2.5" />
                        <input
                          type="tel"
                          required
                          value={regForm.mobile}
                          onChange={(e) => setRegForm({ ...regForm, mobile: e.target.value })}
                          className="w-full ps-8 pe-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 mb-1">
                        {lang === 'ar' ? 'الصف الدراسي *' : 'Grade *'}
                      </label>
                      <select
                        value={regForm.grade}
                        onChange={(e) => setRegForm({ ...regForm, grade: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                      >
                        <option value="Grade 9">Grade 9 (الصف التاسع)</option>
                        <option value="Grade 10">Grade 10 (الصف العاشر)</option>
                        <option value="Grade 11">Grade 11 (الصف الحادي عشر)</option>
                        <option value="Grade 12">Grade 12 (الصف الثاني عشر)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 mb-1">
                        {lang === 'ar' ? 'الجنس *' : 'Gender *'}
                      </label>
                      <select
                        value={regForm.gender}
                        onChange={(e) => setRegForm({ ...regForm, gender: e.target.value as 'male' | 'female' })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                      >
                        <option value="female">{lang === 'ar' ? 'أنثى' : 'Female'}</option>
                        <option value="male">{lang === 'ar' ? 'ذكر' : 'Male'}</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">
                        {lang === 'ar' ? 'تاريخ الميلاد *' : 'Date of Birth *'}
                      </label>
                      <div className="relative">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 absolute start-2.5 top-2.5" />
                        <input
                          type="date"
                          required
                          value={regForm.dateOfBirth}
                          onChange={(e) => setRegForm({ ...regForm, dateOfBirth: e.target.value })}
                          className="w-full ps-8 pe-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 mb-1">
                        {lang === 'ar' ? 'اسم ولي الأمر *' : 'Guardian Name *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={regForm.guardianName}
                        onChange={(e) => setRegForm({ ...regForm, guardianName: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">
                        {lang === 'ar' ? 'كلمة المرور *' : 'Password *'}
                      </label>
                      <input
                        type="password"
                        required
                        value={regForm.password}
                        onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">
                        {lang === 'ar' ? 'تأكيد كلمة المرور *' : 'Confirm Password *'}
                      </label>
                      <input
                        type="password"
                        required
                        value={regForm.confirmPassword}
                        onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setStep('auth_check')}
                      className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-medium cursor-pointer"
                    >
                      {lang === 'ar' ? 'رجوع' : 'Back'}
                    </button>

                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>{lang === 'ar' ? 'إنشاء الحساب ومتابعة الانضمام' : 'Create Account & Join Team'}</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* STEP 4: FINAL JOIN CONFIRMATION */}
            {step === 'confirm' && validationResult?.team && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6 text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 mx-auto flex items-center justify-center">
                  <ShieldCheck className="w-7 h-7" />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {lang === 'ar' ? 'تأكيد الانضمام للفريق' : 'Confirm Team'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {lang === 'ar'
                      ? 'يرجى مراجعة التفاصيل قبل تأكيد انضمامك الرسمي إلى فريق المسابقة.'
                      : 'Please review the details below before completing your official team registration.'}
                  </p>
                </div>

                {/* Review Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-start space-y-3 text-xs">
                  <div className="text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                    {lang === 'ar' ? 'أنت على وشك الانضمام إلى:' : 'You are joining:'}
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-slate-600">{lang === 'ar' ? 'المسابقة:' : 'Competition:'}</span>
                      <strong className="text-slate-900 font-bold">App Challenge 2026</strong>
                    </div>

                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-slate-600">{lang === 'ar' ? 'المدرسة:' : 'School:'}</span>
                      <strong className="text-slate-900 font-bold">{validationResult.school?.nameEn || 'Al-Nahda School'}</strong>
                    </div>

                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-slate-600">{lang === 'ar' ? 'الفريق:' : 'Team:'}</span>
                      <strong className="text-indigo-700 font-bold text-sm">{validationResult.team.teamName}</strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">{lang === 'ar' ? 'العدد الحالي للأعضاء:' : 'Current Members:'}</span>
                      <span className="font-bold text-slate-800">
                        {validationResult.team.memberIds.length} / 5
                        <span className="text-indigo-600 ms-1">
                          ({lang === 'ar' ? `سيصبح ${validationResult.team.memberIds.length + 1} بعد انضمامك` : `will become ${validationResult.team.memberIds.length + 1} after you join`})
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('verify_team')}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-medium transition-colors cursor-pointer"
                  >
                    {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>

                  <button
                    type="button"
                    onClick={handleFinalConfirmJoin}
                    className="px-7 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md hover:shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{lang === 'ar' ? 'تأكيد والانضمام للفريق' : 'Confirm & Join Team'}</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 5: SUCCESS SCREEN */}
            {step === 'success' && joinedResult && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 text-center py-2"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/10">
                  <CheckCircle2 className="w-9 h-9" />
                </div>

                <div>
                  <h3 className="text-2xl font-black text-slate-900">
                    {lang === 'ar' ? '✓ لقد انضممت بنجاح إلى فريق ' + joinedResult.teamName + '!' : `✓ You have successfully joined ${joinedResult.teamName}!`}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    {lang === 'ar'
                      ? 'تم تسجيلك رسمياً كعضو في الفريق. ستظهر الآن بطاقة تحدي التطبيقات 2026 في لوحة تحكم الطالب الخاصة بك.'
                      : 'You are now officially a registered team member. The App Challenge 2026 module is now available on your Student Dashboard.'}
                  </p>
                </div>

                {/* Success Card Breakdown */}
                <div className="bg-gradient-to-br from-emerald-50 via-white to-slate-50 border-2 border-emerald-200 rounded-2xl p-5 text-start max-w-lg mx-auto shadow-sm space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-emerald-100 text-xs">
                    <span className="text-slate-600">{lang === 'ar' ? 'المسابقة:' : 'Competition:'}</span>
                    <strong className="text-slate-900 font-bold">App Challenge 2026</strong>
                  </div>

                  <div className="flex items-center justify-between pb-2 border-b border-emerald-100 text-xs">
                    <span className="text-slate-600">{lang === 'ar' ? 'المدرسة:' : 'School:'}</span>
                    <strong className="text-slate-900 font-bold">{joinedResult.schoolName}</strong>
                  </div>

                  <div className="flex items-center justify-between pb-2 border-b border-emerald-100 text-xs">
                    <span className="text-slate-600">{lang === 'ar' ? 'الفريق:' : 'Team:'}</span>
                    <strong className="text-indigo-700 font-black text-sm">{joinedResult.teamName}</strong>
                  </div>

                  <div className="flex items-center justify-between pb-2 border-b border-emerald-100 text-xs">
                    <span className="text-slate-600">{lang === 'ar' ? 'إجمالي أعضاء الفريق:' : 'Team Members:'}</span>
                    <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      {joinedResult.memberCount} / 5 {lang === 'ar' ? 'أعضاء' : 'Members'}
                    </span>
                  </div>

                  {/* Team Members List */}
                  <div className="pt-2">
                    <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                      {lang === 'ar' ? 'قائمة أعضاء الفريق المحدثة:' : 'Updated Team Members:'}
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                        <span className="font-medium text-slate-800">Ahmad Al-Mansoor</span>
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                          {lang === 'ar' ? 'قائد الفريق' : 'Team Leader'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                        <span className="font-medium text-slate-800">Sara Tariq</span>
                        <span className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {lang === 'ar' ? 'عضو' : 'Member'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                        <span className="font-medium text-slate-800">Omar Khalid</span>
                        <span className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {lang === 'ar' ? 'عضو' : 'Member'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-300">
                        <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          {joinedResult.studentName} ({lang === 'ar' ? 'أنت' : 'You'})
                        </span>
                        <span className="text-[10px] font-bold bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded">
                          {lang === 'ar' ? 'عضو جديد' : 'New Member'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Destination Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRole('student');
                      onClose();
                      if (onNavigateToTeam) {
                        onNavigateToTeam(joinedResult.teamId);
                      }
                    }}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Users className="w-4 h-4" />
                    <span>{lang === 'ar' ? 'الانتقال إلى صفحتي والفريق' : 'Go to My Team'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRole('student');
                      onClose();
                      if (onNavigateToDashboard) {
                        onNavigateToDashboard();
                      }
                    }}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Layers className="w-4 h-4" />
                    <span>{lang === 'ar' ? 'لوحة تحكم المسابقة' : 'Go to Competition Dashboard'}</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

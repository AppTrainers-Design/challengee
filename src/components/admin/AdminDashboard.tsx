import React, { useState } from 'react';
import { useCompetition } from '../../context/CompetitionContext';
import { StatusBadge } from '../common/StatusBadge';
import { Stepper } from '../common/Stepper';
import {
  Shield,
  Building,
  Users,
  Gamepad2,
  Gavel,
  Trophy,
  Sliders,
  History,
  Check,
  X,
  AlertTriangle,
  Lock,
  Unlock,
  EyeOff,
  Eye,
  Search,
  CheckCircle2,
  Calendar,
  Sparkles,
  ExternalLink,
  Award,
  BookOpen,
} from 'lucide-react';
import { CompetitionStatus } from '../../types';

export const AdminDashboard: React.FC = () => {
  const {
    lang,
    t,
    competition,
    setCompetitionPhase,
    toggleBlindEvaluation,
    setResultsVisibility,
    schools,
    approveSchool,
    rejectSchool,
    teams,
    approveTeam,
    rejectTeam,
    submissions,
    reopenSubmission,
    judges,
    evaluations,
    unlockEvaluation,
    assignJudgeToSubmission,
    teamSummaries,
    awards,
    assignAwardToTeam,
  } = useCompetition();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'schools' | 'teams' | 'submissions' | 'judges' | 'rankings'
  >('overview');

  const [searchTerm, setSearchTerm] = useState('');
  const [rejectModal, setRejectModal] = useState<{ type: 'school' | 'team'; id: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const [reopenModal, setReopenModal] = useState<string | null>(null);
  const [reopenReason, setReopenReason] = useState('');

  const [unlockEvalModal, setUnlockEvalModal] = useState<string | null>(null);
  const [unlockReason, setUnlockReason] = useState('');

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (text: string) => {
    setToastMsg(text);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Metrics
  const pendingSchools = schools.filter((s) => s.status === 'pending');
  const pendingTeams = teams.filter((t) => t.status === 'pending');
  const submittedGames = submissions.filter((s) => s.status === 'submitted');
  const completedEvals = evaluations.filter((e) => e.status === 'submitted');

  // Detect score discrepancies (> 15 points difference between judges on same game)
  const gamesWithDiscrepancy = submissions.filter((sub) => {
    const evals = evaluations.filter((e) => e.submissionId === sub.id && e.status === 'submitted');
    if (evals.length < 2) return false;
    const scores = evals.map((e) => e.totalScore);
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);
    return maxScore - minScore >= 15;
  });

  const handleApproveSchool = (id: string) => {
    approveSchool(id);
    showToast(lang === 'ar' ? 'تم اعتماد المدرسة رسمياً وتفعيل حساب ممثلها.' : 'School approved officially.');
  };

  const handleRejectSchoolSubmit = () => {
    if (!rejectModal || !rejectReason.trim()) return;
    if (rejectModal.type === 'school') {
      rejectSchool(rejectModal.id, rejectReason);
      showToast(lang === 'ar' ? 'تم رفض طلب تسجيل المدرسة مع إشعار الممثل بالسبب.' : 'School registration rejected.');
    } else {
      rejectTeam(rejectModal.id, rejectReason);
      showToast(lang === 'ar' ? 'تم رفض الفريق مع إشعار المدرسة بالسبب.' : 'Team rejected with feedback.');
    }
    setRejectModal(null);
    setRejectReason('');
  };

  const handleReopenSubmit = () => {
    if (!reopenModal || !reopenReason.trim()) return;
    reopenSubmission(reopenModal, reopenReason);
    setReopenModal(null);
    setReopenReason('');
    showToast(lang === 'ar' ? 'تم فك قفل التسليم وتدوين العملية في سجل التدقيق.' : 'Submission unlocked for editing.');
  };

  const handleUnlockEvalSubmit = () => {
    if (!unlockEvalModal || !unlockReason.trim()) return;
    unlockEvaluation(unlockEvalModal, unlockReason);
    setUnlockEvalModal(null);
    setUnlockReason('');
    showToast(lang === 'ar' ? 'تم فك قفل استمارة التقييم للمحكم.' : 'Evaluation rubric unlocked for judge.');
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Admin Command Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 flex items-center justify-center shrink-0">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-black">
                {lang === 'ar' ? 'لوحة القيادة المركزية لإدارة المسابقة' : 'Competition Central Command & Governance'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {lang === 'ar'
                ? 'إدارة اعتماد المدارس، الموافقة على الفرق، تتبع التدريب، ضبط النزاهة والتحكيم الأعمى، وإعلان النتائج'
                : 'Manage school accreditations, team approvals, submission locks, blind evaluation, and certified rankings'}
            </p>
          </div>
        </div>

        {/* Global Fast Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Blind Mode toggle */}
          <button
            onClick={toggleBlindEvaluation}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
              competition.blindEvaluationEnabled
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {competition.blindEvaluationEnabled ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>
              {competition.blindEvaluationEnabled
                ? lang === 'ar'
                  ? 'التحكيم الأعمى: مفعّل'
                  : 'Blind Mode: Active'
                : lang === 'ar'
                ? 'التحكيم الأعمى: معطل'
                : 'Blind Mode: Disabled'}
            </span>
          </button>

          {/* Results visibility toggle */}
          <button
            onClick={() =>
              setResultsVisibility(competition.resultsVisibility === 'published' ? 'internal_review' : 'published')
            }
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
              competition.resultsVisibility === 'published'
                ? 'bg-amber-500 border-amber-400 text-slate-950 font-black shadow-sm'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>
              {competition.resultsVisibility === 'published'
                ? lang === 'ar'
                  ? 'النتائج: منشورة علناً'
                  : 'Results: Public'
                : lang === 'ar'
                ? 'النتائج: سرية / مراجعة'
                : 'Results: Private'}
            </span>
          </button>
        </div>
      </div>

      {/* Stepper with Manual Phase Override Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {lang === 'ar' ? 'مراحل المسابقة والتحكم الزمني المباشر' : 'Competition Lifecycle & Manual Phase Switch'}
            </h3>
            <p className="text-xs text-slate-500">
              {lang === 'ar'
                ? 'يمكن للأدمن نقل المسابقة يدوياً بين المراحل لاختبار أو إدارة الجدول الزمني'
                : 'Super Admin can manually advance or rewind the official phase at any time'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">{lang === 'ar' ? 'تغيير المرحلة:' : 'Change Phase:'}</span>
            <select
              value={competition.status}
              onChange={(e) => setCompetitionPhase(e.target.value as CompetitionStatus)}
              className="px-3 py-1.5 text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
            >
              <option value="draft">1. Draft</option>
              <option value="registration_open">2. Registration Open</option>
              <option value="registration_closed">3. Registration Closed</option>
              <option value="training_active">4. Training Active (LMS)</option>
              <option value="development_active">5. Game Dev Active</option>
              <option value="submission_deadline_passed">6. Submission Closed</option>
              <option value="evaluation_active">7. Evaluation / Judging</option>
              <option value="results_published">8. Results Published</option>
              <option value="completed">9. Completed</option>
            </select>
          </div>
        </div>

        <Stepper currentStatus={competition.status} />
      </div>

      {/* Toast Notice */}
      {toastMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="cursor-pointer text-slate-500">
            ✕
          </button>
        </div>
      )}

      {/* Discrepancy Alert Banner */}
      {gamesWithDiscrepancy.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold">
              {lang === 'ar'
                ? 'تنبيه النزاهة: رصد تفاوت كبير في درجات المحكمين (Discrepancy Alert)'
                : 'Integrity Alert: Large Judge Score Discrepancy Detected (≥ 15 pts)'}
            </h4>
            <p className="mt-0.5 text-amber-800">
              {lang === 'ar'
                ? `هناك ${gamesWithDiscrepancy.length} ألعاب تختلف فيها درجات المحكمين بأكثر من 15 نقطة. يوصى بمراجعة الاستمارات أو تعيين محكم ثالث مرجح.`
                : `${gamesWithDiscrepancy.length} game submission has a score difference ≥ 15 points between judges. Recommend review or assigning a third tie-breaker judge.`}
            </p>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">{lang === 'ar' ? 'المدارس' : 'Schools'}</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{schools.length}</p>
          <span className="text-[11px] text-amber-600 font-semibold block">{pendingSchools.length} pending approval</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">{lang === 'ar' ? 'الفرق' : 'Teams'}</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{teams.length}</p>
          <span className="text-[11px] text-blue-600 font-semibold block">{pendingTeams.length} pending approval</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">{lang === 'ar' ? 'الألعاب المسلمة' : 'Submissions'}</span>
          <p className="text-2xl font-black text-purple-600 mt-1">{submittedGames.length}</p>
          <span className="text-[11px] text-slate-400 block">Locked for evaluation</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">{lang === 'ar' ? 'التقييمات المكتملة' : 'Evaluations'}</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{completedEvals.length}</p>
          <span className="text-[11px] text-slate-400 block">Official jury scores</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 flex gap-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap border-b-2 ${
            activeTab === 'overview'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>{lang === 'ar' ? 'نظرة عامة' : 'System Overview'}</span>
        </button>

        <button
          onClick={() => setActiveTab('schools')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap border-b-2 ${
            activeTab === 'schools'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>{lang === 'ar' ? 'اعتماد المدارس' : 'School Approvals'}</span>
          {pendingSchools.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
              {pendingSchools.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('teams')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap border-b-2 ${
            activeTab === 'teams'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{lang === 'ar' ? 'مراجعة الفرق' : 'Team Verification'}</span>
          {pendingTeams.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
              {pendingTeams.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('submissions')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap border-b-2 ${
            activeTab === 'submissions'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Gamepad2 className="w-4 h-4" />
          <span>{lang === 'ar' ? 'تسليمات الألعاب' : 'Game Submissions'}</span>
        </button>

        <button
          onClick={() => setActiveTab('judges')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap border-b-2 ${
            activeTab === 'judges'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Gavel className="w-4 h-4" />
          <span>{lang === 'ar' ? 'لجنة التحكيم وتوزيع الألعاب' : 'Jury & Assignments'}</span>
        </button>

        <button
          onClick={() => setActiveTab('rankings')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap border-b-2 ${
            activeTab === 'rankings'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>{lang === 'ar' ? 'الترتيب وتوزيع الجوائز' : 'Leaderboard & Awards'}</span>
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>{lang === 'ar' ? 'مواعيد المسابقة الرسمية' : 'Scheduled Phase Windows'}</span>
              </h3>

              <div className="space-y-2 text-xs divide-y divide-slate-100">
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-500">{lang === 'ar' ? 'فترة التسجيل:' : 'Registration Period:'}</span>
                  <span className="font-semibold text-slate-800">
                    {competition.registrationStartDate} → {competition.registrationEndDate}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-slate-500">{lang === 'ar' ? 'معسكر التدريب (LMS):' : 'LMS Bootcamp:'}</span>
                  <span className="font-semibold text-slate-800">
                    {competition.trainingStartDate} → {competition.trainingEndDate}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-slate-500">{lang === 'ar' ? 'الموعد النهائي للتسليم:' : 'Submission Deadline:'}</span>
                  <span className="font-bold text-rose-600">{competition.submissionDeadline}</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-slate-500">{lang === 'ar' ? 'فترة التحكيم:' : 'Evaluation Period:'}</span>
                  <span className="font-semibold text-slate-800">
                    {competition.evaluationStartDate} → {competition.evaluationEndDate}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-slate-500">{lang === 'ar' ? 'إعلان الفائزين:' : 'Announcement:'}</span>
                  <span className="font-bold text-amber-600">{competition.resultsAnnouncementDate}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <span>{lang === 'ar' ? 'ضوابط النزاهة وحصص المشاركة' : 'Competition Constraints & Rules'}</span>
              </h3>

              <div className="space-y-2 text-xs divide-y divide-slate-100">
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-500">{lang === 'ar' ? 'الحد الأقصى لفرق المدرسة:' : 'Max Teams / School:'}</span>
                  <span className="font-black text-slate-800">{competition.maxTeamsPerSchool} Teams</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-slate-500">{lang === 'ar' ? 'حجم الفريق المسموح:' : 'Allowed Team Size:'}</span>
                  <span className="font-black text-slate-800">
                    {competition.minStudentsPerTeam} to {competition.maxStudentsPerTeam} Students
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-slate-500">{lang === 'ar' ? 'وضع التحكيم الأعمى:' : 'Blind Evaluation Status:'}</span>
                  <span className="font-bold text-indigo-600">
                    {competition.blindEvaluationEnabled ? 'Enabled (School Masked)' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-slate-500">{lang === 'ar' ? 'ظهور النتائج للجمهور:' : 'Public Leaderboard:'}</span>
                  <span className="font-bold text-emerald-600 capitalize">
                    {competition.resultsVisibility}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Schools Approval Queue */}
      {activeTab === 'schools' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {lang === 'ar' ? 'طلبات تسجيل المدارس واعتمادها' : 'School Registration Queue'}
              </h2>
              <p className="text-xs text-slate-500">
                {lang === 'ar'
                  ? 'تدقيق صفة ممثل المدرسة وصلاحيته قبل تمكينه من تكوين الفرق'
                  : 'Verify authorization and grant official school accreditation'}
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 text-start">{lang === 'ar' ? 'المدرسة' : 'School'}</th>
                    <th className="py-3 px-4 text-start">{lang === 'ar' ? 'الممثل الرسمي' : 'Representative'}</th>
                    <th className="py-3 px-4 text-start">{lang === 'ar' ? 'المدينة والمحافظة' : 'Location'}</th>
                    <th className="py-3 px-4 text-center">{lang === 'ar' ? 'الفرق المتوقعة' : 'Expected Teams'}</th>
                    <th className="py-3 px-4 text-center">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                    <th className="py-3 px-4 text-end">{lang === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {schools.map((sch) => (
                    <tr key={sch.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {lang === 'ar' ? sch.nameAr : sch.nameEn}
                        <span className="text-[10px] text-slate-400 block font-normal">{sch.email}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800">{sch.representativeName}</span>
                        <span className="text-[10px] text-slate-500 block">{sch.representativeJobTitle}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {sch.cityArea}, {sch.governorate}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                        {sch.expectedTeams}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <StatusBadge status={sch.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-end">
                        {sch.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleApproveSchool(sch.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{lang === 'ar' ? 'اعتماد' : 'Approve'}</span>
                            </button>
                            <button
                              onClick={() => setRejectModal({ type: 'school', id: sch.id })}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-lg font-bold cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>{lang === 'ar' ? 'رفض' : 'Reject'}</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Teams Review */}
      {activeTab === 'teams' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {lang === 'ar' ? 'مراجعة وتدقيق الفرق الطلابية' : 'Team Verification & Roster Validation'}
              </h2>
              <p className="text-xs text-slate-500">
                {lang === 'ar'
                  ? 'فحص سعة الأعضاء (3-5 طلاب) واعتماد الفريق للمشاركة والانضمام لمعسكر LMS'
                  : 'Verify 3-5 member constraint and officially approve team for LMS bootcamp enrollment'}
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 text-start">{lang === 'ar' ? 'الفريق' : 'Team'}</th>
                    <th className="py-3 px-4 text-start">{lang === 'ar' ? 'المدرسة' : 'School'}</th>
                    <th className="py-3 px-4 text-center">{lang === 'ar' ? 'رمز الفريق' : 'Team Code'}</th>
                    <th className="py-3 px-4 text-center">{lang === 'ar' ? 'عدد الأعضاء' : 'Members'}</th>
                    <th className="py-3 px-4 text-center">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                    <th className="py-3 px-4 text-end">{lang === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {teams.map((tm) => {
                    const sch = schools.find((s) => s.id === tm.schoolId);
                    const hasValidSize =
                      tm.memberIds.length >= competition.minStudentsPerTeam &&
                      tm.memberIds.length <= competition.maxStudentsPerTeam;

                    return (
                      <tr key={tm.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {tm.teamName}
                          <span className="text-[10px] text-slate-400 block font-normal">
                            Mentor: {tm.mentorName || 'None'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{sch?.nameEn}</td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-blue-700">
                          {tm.teamCode}
                        </td>
                        <td className="py-3.5 px-4 text-center font-semibold">
                          <span
                            className={`px-2 py-0.5 rounded-full ${
                              hasValidSize
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {tm.memberIds.length} / {competition.maxStudentsPerTeam}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <StatusBadge status={tm.status} size="sm" />
                        </td>
                        <td className="py-3.5 px-4 text-end">
                          {tm.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  approveTeam(tm.id);
                                  showToast(
                                    lang === 'ar'
                                      ? `تم اعتماد فريق ${tm.teamName} بنجاح!`
                                      : `Team ${tm.teamName} approved!`
                                  );
                                }}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>{lang === 'ar' ? 'اعتماد' : 'Approve'}</span>
                              </button>
                              <button
                                onClick={() => setRejectModal({ type: 'team', id: tm.id })}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-lg font-bold cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>{lang === 'ar' ? 'رفض' : 'Reject'}</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px]">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Submissions Management */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {lang === 'ar' ? 'تسليمات الألعاب وإدارة القفل' : 'Game Submissions & Reopen Controls'}
              </h2>
              <p className="text-xs text-slate-500">
                {lang === 'ar'
                  ? 'مراجعة الألعاب المسلمة، وتوفير خاصية إعادة فتح التسليم المقفل مع تدوين السبب الأمني'
                  : 'Inspect builds, pitch decks, and utilize auditable submission reopening if requested'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {submissions.map((sub) => {
              const team = teams.find((t) => t.id === sub.teamId);
              const school = schools.find((s) => s.id === team?.schoolId);

              return (
                <div
                  key={sub.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 hover:border-indigo-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-black text-slate-900">
                        {lang === 'ar' ? sub.gameNameAr : sub.gameNameEn}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {team?.teamName} · {school?.nameEn}
                      </p>
                    </div>
                    <StatusBadge status={sub.status} size="sm" />
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">
                    {lang === 'ar' ? sub.shortDescAr : sub.shortDescEn}
                  </p>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-150 text-xs space-y-1">
                    <p>
                      <strong>{lang === 'ar' ? 'المنصة:' : 'Platform:'}</strong> {sub.targetPlatform} ({sub.genre})
                    </p>
                    <p>
                      <strong>{lang === 'ar' ? 'الإصدار الحالي:' : 'Version:'}</strong> v{sub.currentVersion}.0
                    </p>
                    <p>
                      <strong>{lang === 'ar' ? 'وقت التسليم:' : 'Submitted At:'}</strong> {sub.finalSubmittedAt || '—'}
                    </p>
                  </div>

                  {/* Artifact links & Admin Reopen Action */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs">
                      {sub.webGameUrl && (
                        <a
                          href={sub.webGameUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:underline font-bold flex items-center gap-1"
                        >
                          <Gamepad2 className="w-3.5 h-3.5" />
                          <span>Play</span>
                        </a>
                      )}
                      {sub.pitchDeckUrl && (
                        <a
                          href={sub.pitchDeckUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-600 hover:underline font-medium"
                        >
                          Pitch Deck
                        </a>
                      )}
                    </div>

                    <button
                      onClick={() => setReopenModal(sub.id)}
                      className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Unlock className="w-3 h-3" />
                      <span>{lang === 'ar' ? 'إعادة فتح التسليم' : 'Reopen Submission'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 5: Jury & Assignments */}
      {activeTab === 'judges' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {lang === 'ar' ? 'هيئة التحكيم وتوزيع الألعاب' : 'Jury Roster & Evaluation Assignments'}
              </h2>
              <p className="text-xs text-slate-500">
                {lang === 'ar'
                  ? 'توزيع الألعاب على المحكمين، وفك قفل الاستمارات بطلب رسمي مع تدوين السبب'
                  : 'Assign submissions to verified judges and manage rubric unlocking'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {judges.map((j) => {
              const myEvals = evaluations.filter((e) => e.judgeId === j.id);
              const doneCount = myEvals.filter((e) => e.status === 'submitted').length;

              return (
                <div
                  key={j.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{j.fullName}</h3>
                      <p className="text-xs text-slate-500">{j.organization}</p>
                      <p className="text-[11px] text-indigo-700 font-semibold mt-0.5">
                        Specialization: {j.specialization}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      {doneCount} / {myEvals.length} Scored
                    </span>
                  </div>

                  {/* Assigned submissions mini list */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                    <span className="font-bold text-slate-700 block text-[11px]">
                      {lang === 'ar' ? 'الألعاب المسندة:' : 'Assigned Submissions:'}
                    </span>
                    {myEvals.map((ev) => {
                      const sub = submissions.find((s) => s.id === ev.submissionId);
                      return (
                        <div
                          key={ev.id}
                          className="p-2 bg-slate-50 rounded-lg flex items-center justify-between"
                        >
                          <div>
                            <span className="font-bold text-slate-800">{sub?.gameNameEn}</span>
                            <span className="text-[11px] text-slate-400 block">
                              Score: {ev.status === 'submitted' ? `${ev.totalScore} / 100` : 'Pending'}
                            </span>
                          </div>
                          {ev.status === 'submitted' ? (
                            <button
                              onClick={() => setUnlockEvalModal(ev.id)}
                              className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded text-[11px] font-bold cursor-pointer flex items-center gap-1"
                            >
                              <Unlock className="w-3 h-3" />
                              <span>{lang === 'ar' ? 'فك القفل' : 'Unlock'}</span>
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[11px]">In Progress</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 6: Rankings & Awards */}
      {activeTab === 'rankings' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {lang === 'ar' ? 'الترتيب العام وتخصيص الجوائز التقديرية' : 'Tournament Standings & Award Allocation'}
              </h2>
              <p className="text-xs text-slate-500">
                {lang === 'ar'
                  ? 'حساب متوسط درجات المحكمين تلقائياً، وتطبيق معايير كسر التعادل المعتمدة'
                  : 'Computed average score from all judges with automated tie-breaker logic applied'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setResultsVisibility('published');
                  showToast(lang === 'ar' ? 'تم نشر النتائج علناً على البوابة!' : 'Results published publicly!');
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trophy className="w-4 h-4" />
                <span>{lang === 'ar' ? 'نشر النتائج علناً للجمهور' : 'Publish Results Publicly'}</span>
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 text-start">{lang === 'ar' ? 'الترتيب' : 'Rank'}</th>
                    <th className="py-3 px-4 text-start">{lang === 'ar' ? 'الفريق' : 'Team'}</th>
                    <th className="py-3 px-4 text-start">{lang === 'ar' ? 'المدرسة' : 'School'}</th>
                    <th className="py-3 px-4 text-start">{lang === 'ar' ? 'اللعبة' : 'Game'}</th>
                    <th className="py-3 px-4 text-center">{lang === 'ar' ? 'المعدل' : 'Average Score'}</th>
                    <th className="py-3 px-4 text-start">{lang === 'ar' ? 'الجائزة التقديرية' : 'Award Category'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {teamSummaries.map((team) => (
                    <tr key={team.teamId} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-black text-sm text-slate-800">
                        {team.rank === 1 ? '🥇 #1' : team.rank === 2 ? '🥈 #2' : team.rank === 3 ? '🥉 #3' : `#${team.rank}`}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{team.teamName}</td>
                      <td className="py-3.5 px-4 text-slate-600">{team.schoolName}</td>
                      <td className="py-3.5 px-4 text-indigo-600 font-semibold">{team.gameName}</td>
                      <td className="py-3.5 px-4 text-center font-black text-sm text-slate-900">
                        {team.averageScore} / 100
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={
                            awards.find((a) => a.assignedTeamId === team.teamId)?.id || ''
                          }
                          onChange={(e) => {
                            if (e.target.value) {
                              assignAwardToTeam(e.target.value, team.teamId);
                              showToast(lang === 'ar' ? 'تم تخصيص الجائزة بنجاح.' : 'Award assigned to team.');
                            }
                          }}
                          className="px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
                        >
                          <option value="">{lang === 'ar' ? '— تخصيص جائزة —' : '— Assign Award —'}</option>
                          {awards.map((aw) => (
                            <option key={aw.id} value={aw.id}>
                              {lang === 'ar' ? aw.titleAr : aw.titleEn}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {lang === 'ar' ? 'سبب الرفض والملاحظات الإدارية' : 'Rejection Reason & Feedback'}
            </h3>
            <p className="text-xs text-slate-500">
              {lang === 'ar'
                ? 'يرجى كتابة سبب الرفض؛ سيتم إرساله للممثل وتدوينه في سجل العمليات والتدقيق.'
                : 'Please specify the rejection rationale. This will be sent to the representative and logged.'}
            </p>

            <textarea
              rows={3}
              required
              placeholder={lang === 'ar' ? 'اكتب سبب الرفض هنا...' : 'State rejection rationale...'}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectModal(null)}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                {t.actions.cancel}
              </button>
              <button
                onClick={handleRejectSchoolSubmit}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
              >
                {lang === 'ar' ? 'تأكيد الرفض' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reopen Submission Modal */}
      {reopenModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Unlock className="w-5 h-5 text-amber-600" />
              <span>{lang === 'ar' ? 'إعادة فتح تسليم مقفل' : 'Reopen Locked Submission'}</span>
            </h3>
            <p className="text-xs text-slate-500">
              {lang === 'ar'
                ? 'وفق متطلبات النزاهة، يُشترط إدخال سبب رسمي لإعادة فتح التسليم، وسيُسجل في سجل التدقيق.'
                : 'Auditable governance requires entering a valid reason for unlocking this submission.'}
            </p>

            <textarea
              rows={3}
              required
              placeholder="e.g. Critical audio asset corruption fix requested by School Representative"
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setReopenModal(null)}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                {t.actions.cancel}
              </button>
              <button
                onClick={handleReopenSubmit}
                className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 rounded-lg"
              >
                {lang === 'ar' ? 'فك القفل وتوثيق السبب' : 'Unlock & Log'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unlock Evaluation Modal */}
      {unlockEvalModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Unlock className="w-5 h-5 text-amber-600" />
              <span>{lang === 'ar' ? 'فك قفل استمارة التحكيم' : 'Unlock Evaluation Rubric'}</span>
            </h3>
            <p className="text-xs text-slate-500">
              {lang === 'ar'
                ? 'يرجى تدوين سبب طلب المحكم تعديل الدرجات، وسيتم توثيق العملية في سجل التدقيق.'
                : 'State the reason for unlocking this evaluation for the judge. This is logged to audit trail.'}
            </p>

            <textarea
              rows={3}
              required
              placeholder="e.g. Judge requested correction on pitch presentation criterion input"
              value={unlockReason}
              onChange={(e) => setUnlockReason(e.target.value)}
              className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setUnlockEvalModal(null)}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                {t.actions.cancel}
              </button>
              <button
                onClick={handleUnlockEvalSubmit}
                className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 rounded-lg"
              >
                {lang === 'ar' ? 'تأكيد فك القفل' : 'Unlock Rubric'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

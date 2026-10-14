import React, { useState } from 'react';
import { useCompetition } from '../../context/CompetitionContext';
import { StatusBadge } from '../common/StatusBadge';
import {
  Gavel,
  Gamepad2,
  CheckCircle2,
  Clock,
  Star,
  ExternalLink,
  Lock,
  Edit3,
  FileText,
  Video,
  Play,
  Save,
  Send,
  EyeOff,
  Eye,
  Info,
  Sparkles,
  Sliders,
  Filter,
} from 'lucide-react';
import { JudgeEvaluation, CriterionScore, GameSubmission } from '../../types';
import { GameTestingModal } from './GameTestingModal';

export const JudgeDashboard: React.FC = () => {
  const {
    lang,
    t,
    competition,
    currentJudge,
    submissions,
    teams,
    schools,
    evaluations,
    criteria,
    saveEvaluationDraft,
    submitEvaluation,
  } = useCompetition();

  const [activeEvalModal, setActiveEvalModal] = useState<JudgeEvaluation | null>(null);
  const [scoresState, setScoresState] = useState<Record<string, number>>({});
  const [feedbackStrengths, setFeedbackStrengths] = useState('');
  const [feedbackImprovements, setFeedbackImprovements] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'completed'>('all');
  const [testingSubmission, setTestingSubmission] = useState<GameSubmission | null>(null);

  // Submissions assigned to this judge (matching teamId with judge's assignedTeamIds or existing evaluations)
  const assignedSubmissions = submissions.filter((s) =>
    (currentJudge?.assignedTeamIds || []).includes(s.teamId) ||
    evaluations.some((e) => e.judgeId === currentJudge?.id && e.teamId === s.teamId)
  );

  const completedCount = evaluations.filter(
    (e) => e.judgeId === currentJudge?.id && e.status === 'submitted'
  ).length;

  const pendingSubmissions = assignedSubmissions.filter((s) => {
    const ev = evaluations.find((e) => e.judgeId === currentJudge?.id && e.teamId === s.teamId);
    return ev?.status !== 'submitted';
  });

  const completedSubmissions = assignedSubmissions.filter((s) => {
    const ev = evaluations.find((e) => e.judgeId === currentJudge?.id && e.teamId === s.teamId);
    return ev?.status === 'submitted';
  });

  const displayedSubmissions =
    filterTab === 'pending'
      ? pendingSubmissions
      : filterTab === 'completed'
      ? completedSubmissions
      : assignedSubmissions;

  const applyScorePreset = (pct: number) => {
    const newScores: Record<string, number> = {};
    criteria.forEach((c) => {
      newScores[c.id] = Math.round(c.maxScore * (pct / 100));
    });
    setScoresState(newScores);
  };

  const openEvaluation = (subTeamId: string) => {
    const existing = evaluations.find(
      (e) => e.judgeId === currentJudge?.id && e.teamId === subTeamId
    );

    if (existing) {
      setActiveEvalModal(existing);
      const scoreMap: Record<string, number> = {};
      existing.scores.forEach((c) => {
        scoreMap[c.criterionId] = c.score;
      });
      setScoresState(scoreMap);
      setFeedbackStrengths(existing.strengths || '');
      setFeedbackImprovements(existing.areasForImprovement || '');
      setRecommendation(existing.recommendations || '');
    } else {
      // Initialize fresh evaluation
      const initialScores: Record<string, number> = {};
      criteria.forEach((c) => {
        initialScores[c.id] = Math.round(c.maxScore * 0.8);
      });
      setScoresState(initialScores);
      setFeedbackStrengths('');
      setFeedbackImprovements('');
      setRecommendation('');
      setActiveEvalModal({
        id: `eval-temp-${Date.now()}`,
        competitionId: competition.id,
        teamId: subTeamId,
        judgeId: currentJudge?.id || 'judge-layla',
        scores: criteria.map((c) => ({
          criterionId: c.id,
          score: initialScores[c.id],
        })),
        totalScore: Object.values(initialScores).reduce((a, b) => a + b, 0),
        strengths: '',
        areasForImprovement: '',
        recommendations: '',
        status: 'draft',
      });
    }
  };

  const calculateCurrentTotal = (): number => {
    return Object.keys(scoresState).reduce((acc, key) => acc + (scoresState[key] || 0), 0);
  };

  const handleScoreChange = (critId: string, val: number, max: number) => {
    const clamped = Math.max(0, Math.min(max, val));
    setScoresState((prev) => ({
      ...prev,
      [critId]: clamped,
    }));
  };

  const handleSaveDraft = () => {
    if (!activeEvalModal) return;
    const critScores: CriterionScore[] = criteria.map((c) => ({
      criterionId: c.id,
      score: scoresState[c.id] || 0,
    }));

    saveEvaluationDraft({
      teamId: activeEvalModal.teamId,
      judgeId: currentJudge?.id || 'judge-layla',
      scores: critScores,
      totalScore: calculateCurrentTotal(),
      strengths: feedbackStrengths,
      areasForImprovement: feedbackImprovements,
      recommendations: recommendation,
    });

    setSaveToast(lang === 'ar' ? 'تم حفظ مسودة التقييم بنجاح!' : 'Evaluation draft saved successfully!');
    setTimeout(() => setSaveToast(null), 3000);
  };

  const handleFinalSubmit = () => {
    if (!activeEvalModal) return;
    const critScores: CriterionScore[] = criteria.map((c) => ({
      criterionId: c.id,
      score: scoresState[c.id] || 0,
    }));

    submitEvaluation({
      teamId: activeEvalModal.teamId,
      judgeId: currentJudge?.id || 'judge-layla',
      scores: critScores,
      totalScore: calculateCurrentTotal(),
      strengths: feedbackStrengths,
      areasForImprovement: feedbackImprovements,
      recommendations: recommendation,
    });

    setShowConfirmModal(false);
    setActiveEvalModal(null);
    setSaveToast(lang === 'ar' ? 'تم تسليم التقييم النهائي بنجاح وتم قفل الاستمارة!' : 'Final evaluation submitted and locked!');
    setTimeout(() => setSaveToast(null), 3500);
  };

  const activeTeam = teams.find((t) => t.id === activeEvalModal?.teamId);
  const activeSubmission = submissions.find((s) => s.teamId === activeEvalModal?.teamId);
  const activeSchool = schools.find((s) => s.id === activeTeam?.schoolId);

  return (
    <div className="space-y-8 pb-12">
      {/* Judge Profile Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
            <Gavel className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-black text-slate-900">{currentJudge?.fullName}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                Official Jury Member
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {currentJudge?.organization} · <strong>{lang === 'ar' ? 'التخصص:' : 'Specialization:'}</strong>{' '}
              {currentJudge?.specialization}
            </p>

            {/* Blind Mode Notice */}
            <div className="mt-2 flex items-center gap-2">
              {competition.blindEvaluationEnabled ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>
                    {lang === 'ar'
                      ? 'نظام التحكيم الأعمى مفعّل (أسماء المدارس مخفية للنزاهة)'
                      : 'Blind Evaluation Active (School Names Masked)'}
                  </span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'التحكيم القياسي (معلومات المدارس مرئية)' : 'Standard Mode (School Names Visible)'}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Progress summary badge */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1 shrink-0">
          <span className="font-bold text-slate-600 block uppercase text-[10px]">
            {lang === 'ar' ? 'إنجاز التحكيم' : 'Judging Progress'}
          </span>
          <p className="text-lg font-black text-slate-900">
            {completedCount} / {assignedSubmissions.length} Games Scored
          </p>
          <div className="w-48 bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all"
              style={{
                width: `${assignedSubmissions.length > 0 ? (completedCount / assignedSubmissions.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {saveToast && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs">
          <span>{saveToast}</span>
          <button onClick={() => setSaveToast(null)} className="cursor-pointer text-slate-500">
            ✕
          </button>
        </div>
      )}

      {/* Assigned Games Queue Header and Filter Tabs */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              {lang === 'ar' ? 'الألعاب المسندة للتقييم والتحكيم' : 'Assigned Game Submissions Queue'}
            </h2>
            <p className="text-xs text-slate-500">
              {lang === 'ar'
                ? 'اختبر اللعبة التفاعلية، راجع وثيقة التصميم (GDD) والعرض التقديمي، ثم املأ استمارة المعايير السبعة'
                : 'Play the interactive build, review GDD and pitch deck, and submit scores across the 7 criteria'}
            </p>
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold self-start">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterTab === 'all'
                  ? 'bg-white text-slate-950 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'ar' ? 'جميع الألعاب' : 'All Games'} ({assignedSubmissions.length})
            </button>
            <button
              onClick={() => setFilterTab('pending')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                filterTab === 'pending'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-amber-800 hover:text-amber-950 bg-amber-100/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'بانتظار تحكيمك' : 'Pending Judging'}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-600 text-white font-mono">
                {pendingSubmissions.length}
              </span>
            </button>
            <button
              onClick={() => setFilterTab('completed')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterTab === 'completed'
                  ? 'bg-white text-slate-950 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'ar' ? 'تم تحكيمها' : 'Completed'} ({completedSubmissions.length})
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedSubmissions.map((sub) => {
            const team = teams.find((t) => t.id === sub.teamId);
            const school = schools.find((s) => s.id === team?.schoolId);
            const myEval = evaluations.find(
              (e) => e.judgeId === currentJudge?.id && e.teamId === sub.teamId
            );
            const isDone = myEval?.status === 'submitted';

            return (
              <div
                key={sub.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs space-y-4 transition-all flex flex-col justify-between ${
                  !isDone
                    ? 'border-amber-400/80 ring-2 ring-amber-400/20 shadow-md'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="space-y-3">
                  {/* Callout badge for pending evaluation */}
                  {!isDone && (
                    <div className="px-3 py-1.5 bg-amber-50 border border-amber-200/80 rounded-xl text-xs font-bold text-amber-900 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>
                          {lang === 'ar'
                            ? 'لعبة بانتظار تحكيمك ورصد الدرجات'
                            : 'Pending Evaluation - Ready for Scoring'}
                        </span>
                      </span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-amber-200/70 rounded text-amber-950">
                        {lang === 'ar' ? 'مطلوب تحكيمها' : 'Ready'}
                      </span>
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-slate-900">
                          {lang === 'ar' ? sub.gameNameAr : sub.gameNameEn}
                        </h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {sub.genre}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {lang === 'ar' ? sub.shortDescAr : sub.shortDescEn}
                      </p>
                    </div>

                    <StatusBadge status={isDone ? 'submitted' : myEval ? 'in_progress' : 'not_started'} size="sm" />
                  </div>

                  {/* Team / School information (Respecting Blind Mode) */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <p className="flex items-center justify-between">
                      <span className="text-slate-500">{lang === 'ar' ? 'رمز الفريق:' : 'Team Code:'}</span>
                      <span className="font-mono font-bold text-slate-900">{team?.teamCode}</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="text-slate-500">{lang === 'ar' ? 'المدرسة المشاركة:' : 'School:'}</span>
                      {competition.blindEvaluationEnabled ? (
                        <span className="text-indigo-700 font-bold italic flex items-center gap-1">
                          <EyeOff className="w-3 h-3" />
                          <span>[Masked for Blind Evaluation]</span>
                        </span>
                      ) : (
                        <span className="font-bold text-slate-900">
                          {school ? (lang === 'ar' ? school.nameAr : school.nameEn) : 'School'}
                        </span>
                      )}
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="text-slate-500">{lang === 'ar' ? 'المنصة المستهدفة:' : 'Platform:'}</span>
                      <span className="font-semibold text-slate-800">{sub.targetPlatform}</span>
                    </p>
                  </div>

                  {/* Quick links to artifacts & Interactive Sandbox */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setTestingSubmission(sub)}
                      className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>{lang === 'ar' ? 'تجربة اللعبة التفاعلية' : 'Playtest Sandbox'}</span>
                    </button>

                    {sub.webGameUrl && (
                      <a
                        href={sub.webGameUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Play className="w-3 h-3" />
                        <span>itch.io</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {sub.pitchDeckUrl && (
                      <a
                        href={sub.pitchDeckUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Pitch Deck</span>
                      </a>
                    )}
                    {sub.gddDocumentUrl && (
                      <a
                        href={sub.gddDocumentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <FileText className="w-3 h-3" />
                        <span>GDD Document</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Card footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    {isDone ? (
                      <div className="flex items-center gap-1 text-emerald-700 font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          {lang === 'ar' ? 'تم التحكيم:' : 'Scored:'} {myEval?.totalScore} / 100
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-500 font-medium">
                        {myEval ? (lang === 'ar' ? 'مسودة قيد الإدخال' : 'Draft in progress') : (lang === 'ar' ? 'لم يتم البدء بعد' : 'Not started')}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => openEvaluation(sub.teamId)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                      isDone
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs'
                    }`}
                  >
                    {isDone ? <Lock className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                    <span>
                      {isDone
                        ? lang === 'ar'
                          ? 'عرض التقييم المقفل'
                          : 'View Locked Rubric'
                        : lang === 'ar'
                        ? 'فتح استمارة التحكيم'
                        : 'Score Submission'}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comprehensive Rubric Modal */}
      {activeEvalModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Official Rubric
                  </span>
                  <h2 className="text-lg font-black text-slate-900">
                    {lang === 'ar' ? activeSubmission?.gameNameAr : activeSubmission?.gameNameEn}
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {competition.blindEvaluationEnabled ? (
                    <span className="text-indigo-600 font-bold">[Blind Mode: School Masked]</span>
                  ) : (
                    <span>🏫 {activeSchool ? (lang === 'ar' ? activeSchool.nameAr : activeSchool.nameEn) : 'School'}</span>
                  )}{' '}
                  · Team Code: <strong>{activeTeam?.teamCode}</strong>
                </p>
              </div>

              {/* Real-time total score counter */}
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-400 text-slate-950 rounded-xl font-black text-center">
                  <span className="text-[10px] uppercase block tracking-wider font-bold">Total Score</span>
                  <span className="text-xl leading-none">{calculateCurrentTotal()} / 100</span>
                </div>
                <button
                  onClick={() => setActiveEvalModal(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Rubric Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Play / Test links banner */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Gamepad2 className="w-4 h-4 text-indigo-600" />
                  <span>{lang === 'ar' ? 'فحص اللعبة والملفات المرفقة قبل التقييم:' : 'Test game and review docs:'}</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {activeSubmission && (
                    <button
                      type="button"
                      onClick={() => setTestingSubmission(activeSubmission)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{lang === 'ar' ? 'تشغيل تجربة اللعبة التفاعلية' : 'Launch Interactive Sandbox'}</span>
                    </button>
                  )}
                  {activeSubmission?.webGameUrl && (
                    <a
                      href={activeSubmission.webGameUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg flex items-center gap-1"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Play Web Build</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {activeSubmission?.pitchDeckUrl && (
                    <a
                      href={activeSubmission.pitchDeckUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Pitch Deck PDF</span>
                    </a>
                  )}
                  {activeSubmission?.gddDocumentUrl && (
                    <a
                      href={activeSubmission.gddDocumentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>GDD PDF</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Quick Calibration Presets (Only when not locked) */}
              {activeEvalModal.status !== 'submitted' && (
                <div className="flex items-center justify-between p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs">
                  <span className="font-semibold text-amber-950 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-amber-600" />
                    <span>{lang === 'ar' ? 'معايرة سريعة للدرجات:' : 'Quick Score Calibration:'}</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => applyScorePreset(92)}
                      className="px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg font-bold cursor-pointer transition-colors"
                    >
                      {lang === 'ar' ? 'ممتاز (92%)' : 'Excellent (92%)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => applyScorePreset(84)}
                      className="px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg font-bold cursor-pointer transition-colors"
                    >
                      {lang === 'ar' ? 'جيد جداً (84%)' : 'Very Good (84%)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => applyScorePreset(75)}
                      className="px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg font-bold cursor-pointer transition-colors"
                    >
                      {lang === 'ar' ? 'جيد (75%)' : 'Good (75%)'}
                    </button>
                  </div>
                </div>
              )}

              {/* 7 Criteria Evaluation Sliders */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  {lang === 'ar' ? 'معايير التقييم السبعة (100 نقطة)' : 'Evaluation Rubric Criteria (100 Points Total)'}
                </h3>

                <div className="space-y-3">
                  {criteria.map((crit) => {
                    const currentVal = scoresState[crit.id] ?? Math.round(crit.maxScore * 0.8);
                    const isLocked = activeEvalModal.status === 'submitted';

                    return (
                      <div
                        key={crit.id}
                        className="p-4 bg-white border border-slate-200 rounded-xl hover:border-amber-300 transition-colors space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-sm text-slate-900">
                              {lang === 'ar' ? crit.nameAr : crit.nameEn}
                            </span>
                            <p className="text-xs text-slate-500">
                              {lang === 'ar' ? crit.descriptionAr : crit.descriptionEn}
                            </p>
                          </div>
                          <div className="text-end">
                            <span className="text-base font-black text-amber-600">
                              {currentVal}
                            </span>
                            <span className="text-xs text-slate-400"> / {crit.maxScore} pts</span>
                          </div>
                        </div>

                        {/* Slider Control */}
                        <div className="flex items-center gap-4 pt-1">
                          <input
                            type="range"
                            min={0}
                            max={crit.maxScore}
                            disabled={isLocked}
                            value={currentVal}
                            onChange={(e) =>
                              handleScoreChange(crit.id, parseInt(e.target.value) || 0, crit.maxScore)
                            }
                            className="flex-1 accent-amber-500 cursor-pointer disabled:opacity-50"
                          />
                          <input
                            type="number"
                            min={0}
                            max={crit.maxScore}
                            disabled={isLocked}
                            value={currentVal}
                            onChange={(e) =>
                              handleScoreChange(crit.id, parseInt(e.target.value) || 0, crit.maxScore)
                            }
                            className="w-16 px-2 py-1 text-center font-bold text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none disabled:bg-slate-50"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Qualitative Written Feedback */}
              <div className="space-y-4 pt-4 border-t border-slate-200 text-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  {lang === 'ar' ? 'الملاحظات النوعية والتوصيات' : 'Qualitative Feedback & Commendations'}
                </h3>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {lang === 'ar' ? 'نقاط القوة والإشادة (Key Strengths)' : 'Key Strengths & Commendations'}
                  </label>
                  <textarea
                    rows={2}
                    disabled={activeEvalModal.status === 'submitted'}
                    placeholder="e.g. Exceptional magnetic physics feel, clean sprite animations, intuitive tutorial."
                    value={feedbackStrengths}
                    onChange={(e) => setFeedbackStrengths(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none disabled:bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {lang === 'ar' ? 'نقاط التطوير والتحسين (Areas for Improvement)' : 'Areas for Improvement'}
                  </label>
                  <textarea
                    rows={2}
                    disabled={activeEvalModal.status === 'submitted'}
                    placeholder="e.g. Level 3 difficulty spike could be smoothed; add sound fx on thruster cut-off."
                    value={feedbackImprovements}
                    onChange={(e) => setFeedbackImprovements(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none disabled:bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {lang === 'ar' ? 'توصية خاصة بالجوائز التقديرية (Award Recommendation)' : 'Special Distinction Recommendation'}
                  </label>
                  <input
                    type="text"
                    disabled={activeEvalModal.status === 'submitted'}
                    placeholder="e.g. Nominated for Best Technical Implementation & Mechanics"
                    value={recommendation}
                    onChange={(e) => setRecommendation(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none disabled:bg-slate-50"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {activeEvalModal.status === 'submitted'
                  ? lang === 'ar'
                    ? 'هذا التقييم مقفل. إذا كنت بحاجة لتعديل الدرجات، اطلب من الأدمن فك قفل الاستمارة.'
                    : 'This evaluation is locked. Contact Admin to request unlocking.'
                  : lang === 'ar'
                  ? 'يمكنك حفظ مسودة ومتابعة التقييم لاحقاً.'
                  : 'Drafts can be saved and resumed at any time.'}
              </span>

              {activeEvalModal.status !== 'submitted' ? (
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
                    className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{lang === 'ar' ? 'اعتماد التقييم النهائي' : 'Submit Final Evaluation'}</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveEvalModal(null)}
                  className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  {t.actions.close}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Submit Evaluation Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-center">
            <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
              <Gavel className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-slate-900">
              {lang === 'ar' ? 'تأكيد اعتماد استمارة التحكيم' : 'Lock & Submit Final Evaluation'}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {lang === 'ar'
                ? `الدرجة الإجمالية المدخلة: ${calculateCurrentTotal()} / 100. بعد الاعتماد، سيتم قفل درجات هذا الفريق وحسابها ضمن الترتيب العام للمسابقة.`
                : `Final calculated score: ${calculateCurrentTotal()} / 100. Once submitted, your scores will be locked and factored into official rankings.`}
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
                className="px-6 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 rounded-xl shadow-sm"
              >
                {lang === 'ar' ? 'تأكيد التسليم والقفل' : 'Confirm & Lock Score'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Game Playtesting Sandbox Modal */}
      {testingSubmission && (
        <GameTestingModal
          submission={testingSubmission}
          lang={lang}
          onClose={() => setTestingSubmission(null)}
          onOpenRubric={(teamId) => {
            setTestingSubmission(null);
            openEvaluation(teamId);
          }}
        />
      )}
    </div>
  );
};

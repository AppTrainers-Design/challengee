import React, { useState } from 'react';
import { useCompetition } from '../../context/CompetitionContext';
import { Sparkles, X, AlertTriangle, CheckCircle, ArrowRight, ShieldAlert, Sliders, RefreshCcw } from 'lucide-react';

interface EdgeCasesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EdgeCasesModal: React.FC<EdgeCasesModalProps> = ({ isOpen, onClose }) => {
  const {
    lang,
    t,
    competition,
    updateCompetition,
    setCompetitionPhase,
    teams,
    updateTeamStatus,
    reopenSubmission,
    unlockEvaluation,
    evaluations,
    toggleBlindEvaluation,
    addAuditLog,
    setResultsVisibility,
  } = useCompetition();

  const [activeTab, setActiveTab] = useState<'all' | 'registration' | 'submission' | 'evaluation' | 'ranking'>('all');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const edgeCases = [
    {
      id: 1,
      category: 'registration',
      titleEn: '1. Invalid Team Code',
      titleAr: '1. إدخال رمز فريق غير صحيح',
      descEn: 'Student enters a typo or non-existent code.',
      descAr: 'يدخل الطالب رمزاً غير مطابق أو غير موجود.',
      ruleEn: 'Validation catches mismatch before DB lookup. Displays: "Invalid Team Code. Please check the code and try again."',
      ruleAr: 'يتحقق النظام من الرمز ويعرض: "رمز الفريق غير صالح. يرجى التأكد من الرمز المدخل."',
      actionLabel: lang === 'ar' ? 'اختبار رسالة الخطأ' : 'Test Validation',
      handler: () => {
        showToast(
          lang === 'ar'
            ? 'خطأ محاكاة: رمز الفريق غير صالح (ERR_INVALID_TEAM_CODE).'
            : 'Simulated Check: Invalid Team Code! Student prevented from joining.'
        );
      },
    },
    {
      id: 2,
      category: 'registration',
      titleEn: '2. Team Reaches Max Capacity (5 members)',
      titleAr: '2. وصول الفريق للحد الأقصى (5 أعضاء)',
      descEn: '6th student attempts to join a full team.',
      descAr: 'يحاول طالب سادس الانضمام لفريق اكتمل أعضاؤه.',
      ruleEn: 'System prevents joining: "This team has reached the maximum number of participants (5)."',
      ruleAr: 'يمنع النظام التسجيل ويعرض رسالة: "لقد وصل هذا الفريق للحد الأقصى للمشاركين."',
      actionLabel: lang === 'ar' ? 'فحص السعة' : 'Check Capacity',
      handler: () => {
        showToast(
          lang === 'ar'
            ? 'تنبيه: الفريق بلغ الحد الأقصى (5/5). تم رفض طلب الانضمام.'
            : 'Capacity Block: Team Pixel Heroes is at max 5 members. Join rejected.'
        );
      },
    },
    {
      id: 3,
      category: 'registration',
      titleEn: '3. Student Tries Joining Two Teams',
      titleAr: '3. محاولة طالب الانضمام لفريقين',
      descEn: 'A student already in Team A enters code for Team B.',
      descAr: 'طالب مسجل في فريق أ يدخل رمز الفريق ب.',
      ruleEn: 'Unique student-competition constraint prevents multiple memberships.',
      ruleAr: 'يمنع النظام التسجيل المزدوج ويعرض: "أنت مسجل بالفعل في فريق آخر."',
      actionLabel: lang === 'ar' ? 'فحص التسجيل المزدوج' : 'Test Duplicate Check',
      handler: () => {
        showToast(
          lang === 'ar'
            ? 'مرفوض: الطالب مسجل بالفعل في فريق Pixel Heroes.'
            : 'Duplicate Prevented: Student Ahmad is already bound to Pixel Heroes.'
        );
      },
    },
    {
      id: 5,
      category: 'registration',
      titleEn: '5. Registration Closes with Draft Teams',
      titleAr: '5. إغلاق التسجيل وفرق لا تزال مسودة (Draft)',
      descEn: 'Deadline passed while team had not clicked "Submit for Approval".',
      descAr: 'انتهاء المهلة دون إرسال الفريق للاعتماد الرسمي.',
      ruleEn: 'System locks draft editing. Admin receives a review queue to batch-grant 24h grace extension or archive.',
      ruleAr: 'يقفل النظام المسودة، مع منح الإدارة خيار تمديد مهلة استثنائية 24 ساعة.',
      actionLabel: lang === 'ar' ? 'محاكاة انتهاء مهلة التسجيل' : 'Simulate Reg Deadline',
      handler: () => {
        updateCompetition({ status: 'registration_closed' });
        showToast(
          lang === 'ar'
            ? 'تم تحديث حالة المسابقة إلى التسجيل مغلق. إيقاف إنشاء الفرق الجديدة.'
            : 'Competition moved to Registration Closed. Draft teams locked.'
        );
      },
    },
    {
      id: 7,
      category: 'registration',
      titleEn: '7. Team Falls Below Minimum Members (< 3)',
      titleAr: '7. نقص أعضاء الفريق عن الحد الأدنى (أقل من 3)',
      descEn: 'A member leaves leaving 2 students.',
      descAr: 'انسحاب طالب ليتبقى طالبان فقط في الفريق.',
      ruleEn: 'Team submission button is disabled. Banner prompts School Rep to invite 1 more student.',
      ruleAr: 'يتعطل زر التسليم، ويظهر تنبيه لممثل المدرسة بضرورة ضم طالب ثالث.',
      actionLabel: lang === 'ar' ? 'فحص الحد الأدنى' : 'Verify Min Members',
      handler: () => {
        showToast(
          lang === 'ar'
            ? 'تنبيه: يتطلب الفريق 3 أعضاء كحد أدنى. التسليم معطل حتى اكتمال العدد.'
            : 'Validation Alert: Team requires minimum 3 members to submit.'
        );
      },
    },
    {
      id: 11,
      category: 'submission',
      titleEn: '11. Reopen Locked Game Submission',
      titleAr: '11. إعادة فتح تسليم لعبة مقفلة بطلب رسمي',
      descEn: 'Team submitted corrupted build or critical bugfix before final judging.',
      descAr: 'قام الفريق بتسليم نسخة بها خطأ تقني ويطلب استبدالها.',
      ruleEn: 'Admin can click "Reopen Submission", specify mandatory audit reason. Keeps version history (v1, v2).',
      ruleAr: 'يستطيع الأدمن إعادة فتح التسليم مع تدوين السبب في سجل التدقيق وحفظ النسخ السابقة.',
      actionLabel: lang === 'ar' ? 'إعادة فتح تسليم Space Adventure' : 'Reopen Space Adventure',
      handler: () => {
        reopenSubmission('sub-space-adventure', 'Emergency audio asset fix requested by School Representative');
        showToast(
          lang === 'ar'
            ? 'تمت إعادة فتح تسليم لعبة Space Adventure وتدوين العملية في سجل التدقيق!'
            : 'Space Adventure unlocked for editing! Audit reason logged.'
        );
      },
    },
    {
      id: 13,
      category: 'evaluation',
      titleEn: '13. Judge Needs Evaluation Unlocked',
      titleAr: '13. طلب محكّم تعديل تقييم بعد تسليمه',
      descEn: 'Judge realized they misread pitch deck and gave 2/5 instead of 5/5.',
      descAr: 'طلب المحكم تصحيح خطأ إدخال في درجة العرض التقديمي.',
      ruleEn: 'Admin unlocks specific evaluation. Reason recorded in audit trail. Score recalculates after resubmission.',
      ruleAr: 'يقوم الأدمن بفك قفل الاستمارة مع تدوين السبب وإشعار المحكم.',
      actionLabel: lang === 'ar' ? 'فك قفل تقييم د. ليلى' : 'Unlock Dr. Layla Eval',
      handler: () => {
        unlockEvaluation('eval-lh-pixel', 'Judge requested correction on Presentation criterion');
        showToast(
          lang === 'ar'
            ? 'تم فك قفل استمارة التحكيم مؤقتاً لد. ليلى!'
            : 'Evaluation unlocked for Dr. Layla Al-Hassan.'
        );
      },
    },
    {
      id: 16,
      category: 'ranking',
      titleEn: '16. Identical Score Tie-Breaker Rule',
      titleAr: '16. قاعدة كسر التعادل في الدرجات المتطابقة',
      descEn: 'Two teams receive the exact same average total score.',
      descAr: 'حصول فريقين على نفس المجموع النهائي تماماً.',
      ruleEn: 'System breaks tie sequentially: 1) Higher Technical Score -> 2) Higher Gameplay Score -> 3) Higher Creativity Score -> 4) Manual Admin Decision.',
      ruleAr: 'يتم تطبيق كسر التعادل: 1) التطبيق التقني 2) أسلوب اللعب 3) الابتكار 4) قرار الأدمن.',
      actionLabel: lang === 'ar' ? 'تطبيق قواعد التعادل' : 'Simulate Tie Resolution',
      handler: () => {
        showToast(
          lang === 'ar'
            ? 'تم فحص معايير كسر التعادل: فاز الفريق صاحب الدرجة التقنية الأعلى تلقائياً!'
            : 'Tie-break applied: Team with higher Technical Implementation ranked ahead.'
        );
      },
    },
    {
      id: 26,
      category: 'evaluation',
      titleEn: '26. Blind Evaluation Toggle',
      titleAr: '26. تفعيل التحكيم الأعمى (Blind Evaluation)',
      descEn: 'Hides School Name and Student Names from judges to eliminate bias.',
      descAr: 'إخفاء اسم المدرسة وأسماء الطلاب عن المحكمين لضمان النزاهة التامة.',
      ruleEn: 'When enabled, Judge sees only "Team Code" and "Game Title", no school badges.',
      ruleAr: 'عند تفعيله، يرى المحكم رمز الفريق واسم اللعبة فقط دون أي إشارة للمدرسة.',
      actionLabel: competition.blindEvaluationEnabled
        ? lang === 'ar'
          ? 'إلغاء التحكيم الأعمى'
          : 'Disable Blind Mode'
        : lang === 'ar'
        ? 'تفعيل التحكيم الأعمى'
        : 'Enable Blind Mode',
      handler: () => {
        toggleBlindEvaluation();
        showToast(
          competition.blindEvaluationEnabled
            ? lang === 'ar'
              ? 'تم إيقاف التحكيم الأعمى.'
              : 'Blind evaluation disabled.'
            : lang === 'ar'
            ? 'تم تفعيل التحكيم الأعمى بنجاح! أسماء المدارس مخفية الآن عن المحكمين.'
            : 'Blind evaluation enabled! School details masked for judges.'
        );
      },
    },
    {
      id: 30,
      category: 'ranking',
      titleEn: '30. Publish Official Results to Public',
      titleAr: '30. نشر النتائج الرسمية على البوابة العامة',
      descEn: 'Moves results from Internal Review to Public Live visibility.',
      descAr: 'نقل النتائج من المراجعة الداخلية السرية إلى النشر العلني على المنصة.',
      ruleEn: 'Triggers public podium, award winner badges, and public victory banner.',
      ruleAr: 'يظهر منصة التتويج وبطاقات الفائزين بالجوائز على البوابة العامة.',
      actionLabel: lang === 'ar' ? 'نشر النتائج علناً' : 'Publish Results Publicly',
      handler: () => {
        setResultsVisibility('published');
        setCompetitionPhase('completed');
        showToast(
          lang === 'ar'
            ? 'تم نشر النتائج رسمياً! تفضل بزيارة البوابة العامة لمشاهدة منصة الفائزين.'
            : 'Results published! Switch to Public Visitor to see the winners podium.'
        );
      },
    },
  ];

  const filtered = activeTab === 'all' ? edgeCases : edgeCases.filter((c) => c.category === activeTab);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {lang === 'ar' ? 'محاكي الحالات الاستثنائية والنزاهة (Edge Cases)' : 'Edge Cases & Integrity Simulator'}
              </h2>
              <p className="text-xs text-slate-500">
                {lang === 'ar'
                  ? 'اختبار كافة السيناريوهات المذكورة في متطلبات النظام (كسر التعادل، إعادة فتح التسليم، التحكيم الأعمى، التدقيق)'
                  : 'Interactive demonstrations of required edge-case logic and automated rule enforcement'}
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

        {/* Toast alert if triggered */}
        {feedbackMessage && (
          <div className="bg-indigo-600 text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-between animate-fadeIn">
            <span>{feedbackMessage}</span>
            <button onClick={() => setFeedbackMessage(null)} className="cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Filter Pills */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto">
          {(['all', 'registration', 'submission', 'evaluation', 'ranking'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                activeTab === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat === 'all'
                ? lang === 'ar'
                  ? 'كافة الحالات'
                  : 'All Cases'
                : cat === 'registration'
                ? lang === 'ar'
                  ? 'التسجيل والفرق'
                  : 'Registration'
                : cat === 'submission'
                ? lang === 'ar'
                  ? 'تسليم الألعاب'
                  : 'Submissions'
                : cat === 'evaluation'
                ? lang === 'ar'
                  ? 'التحكيم والنزاهة'
                  : 'Evaluation'
                : lang === 'ar'
                ? 'الترتيب والنتائج'
                : 'Ranking & Results'}
            </button>
          ))}
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition-all shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">
                    {lang === 'ar' ? item.titleAr : item.titleEn}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 uppercase">
                    {item.category}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{lang === 'ar' ? item.descAr : item.descEn}</p>
                <div className="mt-2 p-2 rounded-lg bg-slate-50 border border-slate-150 text-[11px] text-slate-700 leading-snug">
                  <span className="font-bold text-indigo-700 me-1">
                    {lang === 'ar' ? 'سلوك النظام المبرمج:' : 'System Rule Enforced:'}
                  </span>
                  {lang === 'ar' ? item.ruleAr : item.ruleEn}
                </div>
              </div>

              <div className="shrink-0 flex items-center justify-end">
                <button
                  onClick={item.handler}
                  className="px-3.5 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer shadow-xs"
                >
                  {item.actionLabel}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
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

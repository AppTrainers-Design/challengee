import React, { useState } from 'react';
import { useCompetition } from '../../context/CompetitionContext';
import { StatusBadge } from '../common/StatusBadge';
import { Stepper } from '../common/Stepper';
import {
  School as SchoolIcon,
  Users,
  Plus,
  Copy,
  Check,
  Send,
  Trash2,
  AlertTriangle,
  Award,
  BookOpen,
  Gamepad2,
  Calendar,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Team } from '../../types';

export const SchoolDashboard: React.FC = () => {
  const {
    lang,
    t,
    competition,
    currentSchool,
    teams,
    students,
    studentProgress,
    submissions,
    createTeam,
    removeTeamMember,
    submitTeamForApproval,
  } = useCompetition();

  const [activeTab, setActiveTab] = useState<'teams' | 'training' | 'submissions'>('teams');
  const [isAddTeamModalOpen, setIsAddTeamModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDesc, setNewTeamDesc] = useState('');
  const [newTeamMentor, setNewTeamMentor] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filter only teams belonging to this school
  const schoolTeams = teams.filter((t) => t.schoolId === (currentSchool?.id || 'school-al-nahda'));

  // Filter students belonging to this school
  const schoolStudents = students.filter((s) => s.schoolId === (currentSchool?.id || 'school-al-nahda'));

  const draftTeamsCount = schoolTeams.filter((t) => t.status === 'draft').length;
  const pendingTeamsCount = schoolTeams.filter((t) => t.status === 'pending').length;
  const approvedTeamsCount = schoolTeams.filter((t) => t.status === 'approved').length;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleCreateTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    if (schoolTeams.length >= competition.maxTeamsPerSchool) {
      setActionMessage({
        type: 'error',
        text:
          lang === 'ar'
            ? `لقد وصلت مدرستكم إلى الحد الأقصى المسموح به للفرق (${competition.maxTeamsPerSchool} فرق).`
            : `Your school has reached the maximum allowed team limit (${competition.maxTeamsPerSchool} teams).`,
      });
      return;
    }

    const created = createTeam(currentSchool?.id || 'school-al-nahda', newTeamName, newTeamDesc, newTeamMentor);
    setIsAddTeamModalOpen(false);
    setNewTeamName('');
    setNewTeamDesc('');
    setNewTeamMentor('');
    setActionMessage({
      type: 'success',
      text:
        lang === 'ar'
          ? `تم إنشاء فريق "${created.teamName}" بنجاح! تم إنشاء رمز الفريق: ${created.teamCode}`
          : `Team "${created.teamName}" created! Team Code: ${created.teamCode}`,
    });
  };

  const handleSubmitTeam = (teamId: string) => {
    const res = submitTeamForApproval(teamId);
    setActionMessage({
      type: res.success ? 'success' : 'error',
      text: res.message,
    });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* School Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <SchoolIcon className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-black text-slate-900">
                {currentSchool ? (lang === 'ar' ? currentSchool.nameAr : currentSchool.nameEn) : 'Al-Nahda Modern School'}
              </h1>
              <StatusBadge status={currentSchool?.status || 'approved'} size="sm" />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              <strong>{lang === 'ar' ? 'الممثل المعتمد:' : 'Representative:'}</strong>{' '}
              {currentSchool?.representativeName} ({currentSchool?.representativeJobTitle}) ·{' '}
              {currentSchool?.representativeEmail}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              📍 {currentSchool?.cityArea}, {currentSchool?.governorate}
            </p>
          </div>
        </div>

        {/* Quick Team Add CTA */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddTeamModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'ar' ? 'إنشاء فريق جديد' : 'Create New Team'}</span>
          </button>
        </div>
      </div>

      {/* Stepper */}
      <Stepper currentStatus={competition.status} />

      {/* Alert toast if action performed */}
      {actionMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage(null)} className="cursor-pointer text-slate-500">
            ✕
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">{lang === 'ar' ? 'إجمالي الفرق' : 'Total Teams'}</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{schoolTeams.length} / {competition.maxTeamsPerSchool}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">{approvedTeamsCount} approved</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">{lang === 'ar' ? 'الطلاب المسجلين' : 'Students'}</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{schoolStudents.length}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Across all teams</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">{lang === 'ar' ? 'الألعاب المسلمة' : 'Submissions'}</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {schoolTeams.filter((t) => submissions.some((s) => s.teamId === t.id && s.status === 'submitted')).length}
          </p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Final builds locked</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">{lang === 'ar' ? 'التدريب المكتمل' : 'Training Rate'}</span>
          <p className="text-2xl font-black text-blue-600 mt-1">94%</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Average completion</span>
        </div>
      </div>

      {/* Tab Controls */}
      <div className="border-b border-slate-200 flex gap-6">
        <button
          onClick={() => setActiveTab('teams')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors border-b-2 ${
            activeTab === 'teams'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{lang === 'ar' ? 'إدارة الفرق والرموز' : 'Teams & Invitation Codes'}</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700">
            {schoolTeams.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('training')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors border-b-2 ${
            activeTab === 'training'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>{lang === 'ar' ? 'متابعة تدريب LMS للطلاب' : 'Student LMS Training Progress'}</span>
        </button>

        <button
          onClick={() => setActiveTab('submissions')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors border-b-2 ${
            activeTab === 'submissions'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Gamepad2 className="w-4 h-4" />
          <span>{lang === 'ar' ? 'حالة تسليم الألعاب' : 'Game Submissions'}</span>
        </button>
      </div>

      {/* Tab 1: Teams Management */}
      {activeTab === 'teams' && (
        <div className="space-y-6">
          {/* Representative Guidance Banner for Student Joining */}
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-white border border-blue-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-blue-600 text-white px-2.5 py-0.5 rounded-full">
                  {lang === 'ar' ? 'إرشادات تسجيل الطلاب' : 'Student Onboarding Guide'}
                </span>
                <span className="text-xs font-semibold text-blue-900">
                  {lang === 'ar' ? 'كيف ينضم الطلاب إلى فرق المدرسة؟' : 'How do students join your teams?'}
                </span>
              </div>
              <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
                {lang === 'ar'
                  ? 'وجه طلابك لزيارة الصفحة العامة للمسابقة واختيار "انضم لفريق مدرستك (للطلاب)" ثم إدخال رمز الفريق الموضح أدناه، أو أرسل لهم رابط الدعوة المباشر. بمجرد اكتمال أعضاء الفريق (3-5 طلاب)، قم بالضغط على "إرسال للاعتماد".'
                  : 'Instruct students to visit the public App Challenge page, click "Join Your School Team (Students)", and enter the Team Code below (or send the direct link). Once a team reaches 3-5 students, submit it for Admin approval.'}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold text-slate-500">
                {schoolTeams.length} / {competition.maxTeamsPerSchool} {lang === 'ar' ? 'فرق مسجلة' : 'Teams Formed'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {lang === 'ar' ? 'فرق مدرسة النهضة الرسمية' : 'School Teams Roster'}
              </h2>
              <p className="text-xs text-slate-500">
                {lang === 'ar'
                  ? 'شارك رمز الفريق أو الرابط مع الطلاب للانضمام. يجب ألا يقل عدد أعضاء الفريق عن 3 ولا يزيد عن 5.'
                  : 'Share team codes with students. Each team requires 3 to 5 students before submitting for Admin approval.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {schoolTeams.map((team) => {
              const teamMembers = students.filter((s) => team.memberIds.includes(s.id));
              const isFull = team.memberIds.length >= competition.maxStudentsPerTeam;
              const hasMin = team.memberIds.length >= competition.minStudentsPerTeam;
              const sub = submissions.find((s) => s.teamId === team.id);

              return (
                <div
                  key={team.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-black text-slate-900">{team.teamName}</h3>
                          <StatusBadge status={team.status} size="sm" />
                        </div>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{team.description}</p>
                      </div>
                    </div>

                    {/* Invitation Code & Link Box */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-500 uppercase">
                          {lang === 'ar' ? 'رمز انضمام الفريق:' : 'Team Code:'}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="font-mono font-black text-sm text-blue-700 tracking-wider bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {team.teamCode}
                          </span>
                          <button
                            onClick={() => handleCopy(team.teamCode, `code-${team.id}`)}
                            className="p-1 text-slate-500 hover:text-blue-600 rounded cursor-pointer"
                            title="Copy Code"
                          >
                            {copiedCode === `code-${team.id}` ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[11px] text-slate-500">
                        <span>{lang === 'ar' ? 'رابط الدعوة المباشر:' : 'Invite Link:'}</span>
                        <button
                          onClick={() =>
                            handleCopy(`https://appchallenge.com/join/${team.teamCode}`, `link-${team.id}`)
                          }
                          className="text-blue-600 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                        >
                          <span>{copiedCode === `link-${team.id}` ? 'Copied!' : 'Copy Link'}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Team Members List */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          <span>
                            {lang === 'ar' ? 'أعضاء الفريق' : 'Team Members'} ({teamMembers.length} /{' '}
                            {competition.maxStudentsPerTeam})
                          </span>
                        </span>
                        {isFull ? (
                          <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold">
                            {lang === 'ar' ? 'الفريق مكتمل' : 'Full Capacity'}
                          </span>
                        ) : (
                          <span className="text-[10px] text-blue-700">
                            {competition.maxStudentsPerTeam - teamMembers.length} slots left
                          </span>
                        )}
                      </div>

                      <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                        {teamMembers.length === 0 ? (
                          <p className="p-3 text-xs text-slate-400 text-center italic">
                            {lang === 'ar' ? 'لم ينضم أي طالب بعد. شارك رمز الفريق.' : 'No students joined yet. Share the code.'}
                          </p>
                        ) : (
                          teamMembers.map((member) => (
                            <div
                              key={member.id}
                              className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors"
                            >
                              <div>
                                <span className="font-bold text-slate-800">
                                  {member.fullName} {member.isLeader && '👑 (Leader)'}
                                </span>
                                <span className="text-[11px] text-slate-400 block">{member.grade} · {member.email}</span>
                              </div>
                              {team.status === 'draft' && (
                                <button
                                  onClick={() => removeTeamMember(team.id, member.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                                  title="Remove student"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      {team.status === 'approved' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{lang === 'ar' ? 'فريق معتمد رسمياً' : 'Official Approved Team'}</span>
                        </span>
                      ) : team.status === 'pending' ? (
                        <span className="text-amber-700 font-semibold">
                          {lang === 'ar' ? 'بانتظار تدقيق الإدارة' : 'Pending Admin Verification'}
                        </span>
                      ) : (
                        <span className="text-slate-500">
                          {hasMin
                            ? lang === 'ar'
                              ? 'جاهز للاعتماد'
                              : 'Ready for Approval'
                            : lang === 'ar'
                            ? `يتطلب ${competition.minStudentsPerTeam - teamMembers.length} طلاب إضافيين`
                            : `Needs ${competition.minStudentsPerTeam - teamMembers.length} more students`}
                        </span>
                      )}
                    </div>

                    {team.status === 'draft' && (
                      <button
                        onClick={() => handleSubmitTeam(team.id)}
                        disabled={!hasMin}
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                          hasMin
                            ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-md hover:shadow-lg ring-2 ring-blue-400/20'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                        }`}
                        title={
                          !hasMin
                            ? `Requires at least ${competition.minStudentsPerTeam} students before submission`
                            : 'Submit team to competition organizers for official review and LMS course enrollment'
                        }
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{lang === 'ar' ? 'إرسال للاعتماد الرسمي' : 'Submit for Admin Approval'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Training Monitoring */}
      {activeTab === 'training' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {lang === 'ar' ? 'سجل متابعة تدريب LMS لطلاب المدرسة' : 'Student LMS Training Attendance & Quizzes'}
              </h2>
              <p className="text-xs text-slate-500">
                {lang === 'ar'
                  ? 'متابعة حضور الطلاب في معسكر تطوير الألعاب، الجلسات، الواجبات، والاختبارات القصيرة'
                  : 'Real-time telemetry synchronized with LMS course: Game Development Training Bootcamp'}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 text-start">{lang === 'ar' ? 'الطالب' : 'Student'}</th>
                    <th className="py-3 px-4 text-start">{lang === 'ar' ? 'الفريق' : 'Team'}</th>
                    <th className="py-3 px-4 text-center">{lang === 'ar' ? 'نسبة الحضور' : 'Attendance'}</th>
                    <th className="py-3 px-4 text-center">{lang === 'ar' ? 'الجلسات المكتملة' : 'Sessions Done'}</th>
                    <th className="py-3 px-4 text-center">{lang === 'ar' ? 'الواجبات' : 'Assignments'}</th>
                    <th className="py-3 px-4 text-center">{lang === 'ar' ? 'درجة الاختبار' : 'Quiz Score'}</th>
                    <th className="py-3 px-4 text-start">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {schoolStudents.map((st) => {
                    const prog = studentProgress.find((p) => p.studentId === st.id);
                    const team = teams.find((t) => t.id === st.teamId);
                    return (
                      <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">{st.fullName}</td>
                        <td className="py-3 px-4 text-slate-600">{team?.teamName || '—'}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-bold text-blue-700">{prog?.attendanceRate || 100}%</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {prog?.completedSessions || 7} / {prog?.totalSessions || 7}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {prog?.assignmentsCompleted || 6} / {prog?.totalAssignments || 6}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-emerald-700">
                          {prog?.quizScore || 90}%
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px]">
                            {lang === 'ar' ? 'مكتمل بنجاح' : 'Completed'}
                          </span>
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

      {/* Tab 3: Submissions */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {lang === 'ar' ? 'حالة تسليم ألعاب فرق المدرسة' : 'Team Game Submissions'}
              </h2>
              <p className="text-xs text-slate-500">
                {lang === 'ar'
                  ? 'مراجعة ملفات الألعاب والعروض التقديمية والنسخ القابلة للعب المسلمة للتحكيم'
                  : 'Track final game files, pitch decks, and playable web URLs delivered for jury evaluation'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {schoolTeams.map((team) => {
              const sub = submissions.find((s) => s.teamId === team.id);
              return (
                <div
                  key={team.id}
                  className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 uppercase">{team.teamName}</span>
                      <h3 className="text-lg font-black text-slate-900 mt-0.5">
                        {sub ? (lang === 'ar' ? sub.gameNameAr : sub.gameNameEn) : 'No Submission Yet'}
                      </h3>
                    </div>
                    <StatusBadge status={sub?.status || 'not_started'} size="sm" />
                  </div>

                  {sub ? (
                    <div className="space-y-3 text-xs">
                      <p className="text-slate-600 line-clamp-2">
                        {lang === 'ar' ? sub.shortDescAr : sub.shortDescEn}
                      </p>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-slate-700">
                        <p>
                          <strong>{lang === 'ar' ? 'المنصة:' : 'Platform:'}</strong> {sub.targetPlatform} ({sub.genre})
                        </p>
                        <p>
                          <strong>{lang === 'ar' ? 'الإصدار الحالي:' : 'Version:'}</strong> v{sub.currentVersion}
                        </p>
                        <p>
                          <strong>{lang === 'ar' ? 'وقت التسليم:' : 'Submitted At:'}</strong> {sub.finalSubmittedAt}
                        </p>
                        <p>
                          <strong>{lang === 'ar' ? 'سُلّمت بواسطة:' : 'Submitted By:'}</strong> {sub.finalSubmittedBy}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {sub.webGameUrl && (
                          <a
                            href={sub.webGameUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 bg-indigo-50 text-indigo-700 font-bold rounded-lg hover:bg-indigo-100 flex items-center gap-1.5"
                          >
                            <Gamepad2 className="w-3.5 h-3.5" />
                            <span>Playable Web Link</span>
                          </a>
                        )}
                        {sub.pitchDeckUrl && (
                          <a
                            href={sub.pitchDeckUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 flex items-center gap-1.5"
                          >
                            <span>Pitch Deck (PDF)</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-slate-400 text-xs italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      {lang === 'ar' ? 'الفريق يعمل حالياً على تطوير اللعبة في استوديو الطلاب.' : 'Team is currently in the development phase.'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Team Modal */}
      {isAddTeamModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {lang === 'ar' ? 'إضافة فريق مسابقة جديد' : 'Create New Competition Team'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {lang === 'ar'
                ? 'سيتم إنشاء رمز دعوة فريد (Team Code) لتمكين الطلاب من الانضمام مباشرة للفريق.'
                : 'A unique Team Code will be automatically generated for students to join.'}
            </p>

            <form onSubmit={handleCreateTeamSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {lang === 'ar' ? 'اسم الفريق *' : 'Team Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cyber Ninjas"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {lang === 'ar' ? 'وصف فكرة اللعبة أو اهتمامات الفريق' : 'Team / Game Premise Description'}
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Exploring 2D physics puzzles with historical Arab architecture."
                  value={newTeamDesc}
                  onChange={(e) => setNewTeamDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {lang === 'ar' ? 'اسم المرشد / المشرف الأكاديمي' : 'Mentor / Teacher Supervisor'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Eng. Zaid Al-Najjar"
                  value={newTeamMentor}
                  onChange={(e) => setNewTeamMentor(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddTeamModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  {t.actions.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs"
                >
                  {lang === 'ar' ? 'تأكيد وإنشاء الرمز' : 'Create & Generate Code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

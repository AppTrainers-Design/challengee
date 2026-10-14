import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Competition,
  School,
  Student,
  Team,
  LMSCourse,
  StudentTrainingProgress,
  GameSubmission,
  Judge,
  EvaluationCriterion,
  JudgeEvaluation,
  TeamScoreSummary,
  WinnerAward,
  NotificationItem,
  AuditLogItem,
  SystemRole,
  Language,
  SchoolApprovalStatus,
  TeamStatus,
  ResultsVisibility,
  CompetitionStatus,
} from '../types';
import {
  INITIAL_COMPETITION,
  INITIAL_SCHOOLS,
  INITIAL_STUDENTS,
  INITIAL_TEAMS,
  INITIAL_LMS_COURSE,
  INITIAL_STUDENT_PROGRESS,
  INITIAL_SUBMISSIONS,
  INITIAL_CRITERIA,
  INITIAL_JUDGES,
  INITIAL_EVALUATIONS,
  INITIAL_AWARDS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
} from '../mockData';
import { translations } from '../locales/translations';

export interface TeamValidationResult {
  valid: boolean;
  errorType?: 'invalid_code' | 'team_full' | 'already_in_team' | 'team_unavailable' | 'registration_closed' | 'school_unapproved';
  errorMessageEn?: string;
  errorMessageAr?: string;
  team?: Team;
  school?: School;
  competition?: Competition;
}

interface CompetitionContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: typeof translations.en;
  role: SystemRole;
  setRole: (role: SystemRole) => void;
  activePersonaId: string;
  setActivePersonaId: (id: string) => void;

  // Data state
  competition: Competition;
  schools: School[];
  students: Student[];
  teams: Team[];
  lmsCourse: LMSCourse;
  studentProgress: StudentTrainingProgress[];
  submissions: GameSubmission[];
  criteria: EvaluationCriterion[];
  judges: Judge[];
  evaluations: JudgeEvaluation[];
  awards: WinnerAward[];
  notifications: NotificationItem[];
  auditLogs: AuditLogItem[];

  // Computed
  teamSummaries: TeamScoreSummary[];
  currentSchool: School | undefined;
  currentStudent: Student | undefined;
  currentTeam: Team | undefined;
  currentJudge: Judge | undefined;

  // Actions
  updateCompetition: (updates: Partial<Competition>) => void;
  setCompetitionPhase: (phase: CompetitionStatus) => void;
  registerSchool: (schoolData: Omit<School, 'id' | 'status' | 'submittedAt'>) => School;
  updateSchoolStatus: (schoolId: string, status: SchoolApprovalStatus, feedback?: string) => void;
  createTeam: (schoolId: string, teamName: string, description: string, mentorName?: string) => Team;
  validateTeamCode: (code: string, currentStudentId?: string) => TeamValidationResult;
  joinTeamWithCode: (studentId: string, code: string) => { success: boolean; message: string };
  registerStudentAndJoinTeam: (studentData: Omit<Student, 'id' | 'teamId'>, teamCode: string) => { success: boolean; message: string; student?: Student; team?: Team };
  loginStudentAndJoinTeam: (studentId: string, teamCode: string) => { success: boolean; message: string; student?: Student; team?: Team };
  removeTeamMember: (teamId: string, studentId: string) => void;
  submitTeamForApproval: (teamId: string) => { success: boolean; message: string };
  updateTeamStatus: (teamId: string, status: TeamStatus, feedback?: string) => void;
  saveSubmissionDraft: (submission: Partial<GameSubmission> & { teamId: string }) => void;
  finalSubmitGame: (submission: Partial<GameSubmission> & { teamId: string }) => void;
  reopenSubmission: (submissionId: string, reason: string) => void;
  inviteJudge: (judge: Omit<Judge, 'id' | 'assignedTeamIds'>) => void;
  toggleJudgeAssignment: (judgeId: string, teamId: string) => void;
  addCriterion: (criterion: Omit<EvaluationCriterion, 'id'>) => void;
  updateCriterion: (id: string, updates: Partial<EvaluationCriterion>) => void;
  deleteCriterion: (id: string) => void;
  saveEvaluationDraft: (evaluation: Partial<JudgeEvaluation> & { teamId: string; judgeId: string }) => void;
  submitEvaluation: (evaluation: Partial<JudgeEvaluation> & { teamId: string; judgeId: string }) => void;
  unlockEvaluation: (evaluationId: string, reason: string) => void;
  toggleBlindEvaluation: () => void;
  setResultsVisibility: (visibility: ResultsVisibility) => void;
  assignAward: (awardId: string, teamId: string | undefined) => void;
  addCustomAward: (award: Omit<WinnerAward, 'id'>) => void;
  addAuditLog: (action: string, actionAr: string, entityType: string, entityId: string, details: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetToDefaults: () => void;
}

const STORAGE_KEY = 'app_challenge_state_v3';

const CompetitionContext = createContext<CompetitionContextType | undefined>(undefined);

export const CompetitionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    return (localStorage.getItem('app_challenge_lang') as Language) || 'en';
  });

  const [role, setRoleState] = useState<SystemRole>('admin');
  const [activePersonaId, setActivePersonaId] = useState<string>('admin');

  // Core Data loaded from local storage or mock defaults
  const [competition, setCompetition] = useState<Competition>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_comp`);
    return saved ? JSON.parse(saved) : INITIAL_COMPETITION;
  });

  const [schools, setSchools] = useState<School[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_schools`);
    if (saved) {
      const parsed: School[] = JSON.parse(saved);
      // Ensure school-future-horizon is approved
      return parsed.map((s) => (s.id === 'school-future-horizon' ? { ...s, status: 'approved' as const } : s));
    }
    return INITIAL_SCHOOLS;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_students`);
    if (saved) {
      const parsed: Student[] = JSON.parse(saved);
      const existingIds = new Set(parsed.map((s) => s.id));
      const missing = INITIAL_STUDENTS.filter((s) => !existingIds.has(s.id));
      return [...parsed, ...missing];
    }
    return INITIAL_STUDENTS;
  });

  const [teams, setTeams] = useState<Team[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_teams`);
    if (saved) {
      const parsed: Team[] = JSON.parse(saved);
      const existingIds = new Set(parsed.map((t) => t.id));
      const missing = INITIAL_TEAMS.filter((t) => !existingIds.has(t.id));
      return [...parsed, ...missing];
    }
    return INITIAL_TEAMS;
  });

  const [lmsCourse] = useState<LMSCourse>(INITIAL_LMS_COURSE);

  const [studentProgress, setStudentProgress] = useState<StudentTrainingProgress[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_progress`);
    return saved ? JSON.parse(saved) : INITIAL_STUDENT_PROGRESS;
  });

  const [submissions, setSubmissions] = useState<GameSubmission[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_subs`);
    if (saved) {
      const parsed: GameSubmission[] = JSON.parse(saved);
      const existingIds = new Set(parsed.map((s) => s.id));
      const missing = INITIAL_SUBMISSIONS.filter((s) => !existingIds.has(s.id));
      return [...parsed, ...missing];
    }
    return INITIAL_SUBMISSIONS;
  });

  const [criteria, setCriteria] = useState<EvaluationCriterion[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_crit`);
    return saved ? JSON.parse(saved) : INITIAL_CRITERIA;
  });

  const [judges, setJudges] = useState<Judge[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_judges`);
    if (saved) {
      const parsed: Judge[] = JSON.parse(saved);
      return parsed.map((j) => {
        if (j.id === 'judge-layla' || j.id === 'judge-tariq' || j.id === 'judge-sarah') {
          const unionTeams = Array.from(
            new Set([...j.assignedTeamIds, 'team-desert-falcons', 'team-sky-innovators'])
          );
          return { ...j, assignedTeamIds: unionTeams };
        }
        return j;
      });
    }
    return INITIAL_JUDGES;
  });

  const [evaluations, setEvaluations] = useState<JudgeEvaluation[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_evals`);
    return saved ? JSON.parse(saved) : INITIAL_EVALUATIONS;
  });

  const [awards, setAwards] = useState<WinnerAward[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_awards`);
    return saved ? JSON.parse(saved) : INITIAL_AWARDS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_notifs`);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_audit`);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  // Sync lang & HTML dir
  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('app_challenge_lang', newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // Persist core state
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_comp`, JSON.stringify(competition));
    localStorage.setItem(`${STORAGE_KEY}_schools`, JSON.stringify(schools));
    localStorage.setItem(`${STORAGE_KEY}_students`, JSON.stringify(students));
    localStorage.setItem(`${STORAGE_KEY}_teams`, JSON.stringify(teams));
    localStorage.setItem(`${STORAGE_KEY}_subs`, JSON.stringify(submissions));
    localStorage.setItem(`${STORAGE_KEY}_crit`, JSON.stringify(criteria));
    localStorage.setItem(`${STORAGE_KEY}_judges`, JSON.stringify(judges));
    localStorage.setItem(`${STORAGE_KEY}_evals`, JSON.stringify(evaluations));
    localStorage.setItem(`${STORAGE_KEY}_awards`, JSON.stringify(awards));
    localStorage.setItem(`${STORAGE_KEY}_notifs`, JSON.stringify(notifications));
    localStorage.setItem(`${STORAGE_KEY}_audit`, JSON.stringify(auditLogs));
    localStorage.setItem(`${STORAGE_KEY}_progress`, JSON.stringify(studentProgress));
  }, [competition, schools, students, teams, submissions, criteria, judges, evaluations, awards, notifications, auditLogs, studentProgress]);

  // Helper for audit logs
  const addAuditLog = (
    action: string,
    actionAr: string,
    entityType: string,
    entityId: string,
    details: string
  ) => {
    const newLog: AuditLogItem = {
      id: `log-${Date.now()}`,
      userName:
        role === 'admin'
          ? 'Admin Superuser'
          : role === 'school_rep'
          ? 'Prof. Muna Al-Sayed'
          : role === 'judge'
          ? 'Dr. Layla Al-Hassan'
          : role === 'student'
          ? 'Ahmad Al-Mansoor'
          : 'User',
      role,
      action,
      actionAr,
      entityType,
      entityId,
      details,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const addNotification = (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>) => {
    const item: NotificationItem = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      isRead: false,
    };
    setNotifications((prev) => [item, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // Switch role and associated active persona
  const setRole = (newRole: SystemRole) => {
    setRoleState(newRole);
    if (newRole === 'admin') setActivePersonaId('admin');
    else if (newRole === 'school_rep') setActivePersonaId('school-al-nahda');
    else if (newRole === 'student') setActivePersonaId('std-ahmad');
    else if (newRole === 'instructor') setActivePersonaId('inst-zaid');
    else if (newRole === 'judge') setActivePersonaId('judge-layla');
    else setActivePersonaId('public');
  };

  // Computed personas
  const currentSchool = useMemo(() => {
    return schools.find((s) => s.id === 'school-al-nahda') || schools[0];
  }, [schools]);

  const currentStudent = useMemo(() => {
    return students.find((st) => st.id === activePersonaId) || students[0];
  }, [students, activePersonaId]);

  const currentTeam = useMemo(() => {
    if (role === 'student' && currentStudent?.teamId) {
      return teams.find((t) => t.id === currentStudent.teamId);
    }
    return teams.find((t) => t.id === 'team-pixel-heroes') || teams[0];
  }, [teams, role, currentStudent]);

  const currentJudge = useMemo(() => {
    return judges.find((j) => j.id === activePersonaId) || judges[0];
  }, [judges, activePersonaId]);

  // Dynamic ranking and scoring calculations with Tie-Breaking rules:
  // 1. Technical Implementation score
  // 2. Gameplay score
  // 3. Creativity score
  // 4. If still tied: Flag manual admin decision required!
  const teamSummaries = useMemo<TeamScoreSummary[]>(() => {
    const list: TeamScoreSummary[] = teams
      .filter((t) => t.status === 'approved')
      .map((t) => {
        const school = schools.find((s) => s.id === t.schoolId);
        const sub = submissions.find((s) => s.teamId === t.id);
        const teamEvals = evaluations.filter((e) => e.teamId === t.id && e.status === 'submitted');
        const assignedJudgeIds = judges
          .filter((j) => j.assignedTeamIds.includes(t.id))
          .map((j) => j.id);

        const individualScores = teamEvals.map((e) => e.totalScore);
        const avgScore =
          individualScores.length > 0
            ? Number(
                (
                  individualScores.reduce((acc, curr) => acc + curr, 0) /
                  individualScores.length
                ).toFixed(1)
              )
            : 0;

        // Breakdown by criterion averages
        const criterionAverages: Record<string, number> = {};
        criteria.forEach((crit) => {
          const critScores = teamEvals
            .map((e) => e.scores.find((s) => s.criterionId === crit.id)?.score || 0)
            .filter((s) => s > 0);
          criterionAverages[crit.id] =
            critScores.length > 0
              ? Number((critScores.reduce((a, b) => a + b, 0) / critScores.length).toFixed(1))
              : 0;
        });

        const award = awards.find((a) => a.assignedTeamId === t.id);

        return {
          teamId: t.id,
          teamName: t.teamName,
          schoolId: t.schoolId,
          schoolName: school ? (lang === 'ar' ? school.nameAr : school.nameEn) : 'School',
          gameName: sub ? (lang === 'ar' ? sub.gameNameAr : sub.gameNameEn) : 'Untitled Game',
          assignedJudgesCount: assignedJudgeIds.length,
          completedEvaluationsCount: teamEvals.length,
          evaluations: teamEvals,
          averageScore: avgScore,
          individualScores,
          criterionAverages,
          rank: 0,
          awardedCategory: award ? (lang === 'ar' ? award.titleAr : award.titleEn) : undefined,
        };
      });

    // Sort with tie-breaking:
    // 1. Average total score descending
    // 2. Technical Implementation criterion average descending
    // 3. Gameplay criterion average descending
    // 4. Creativity criterion average descending
    list.sort((a, b) => {
      if (b.averageScore !== a.averageScore) {
        return b.averageScore - a.averageScore;
      }
      const bTech = b.criterionAverages['crit-technical'] || 0;
      const aTech = a.criterionAverages['crit-technical'] || 0;
      if (bTech !== aTech) return bTech - aTech;

      const bPlay = b.criterionAverages['crit-gameplay'] || 0;
      const aPlay = a.criterionAverages['crit-gameplay'] || 0;
      if (bPlay !== aPlay) return bPlay - aPlay;

      const bCrit = b.criterionAverages['crit-creativity'] || 0;
      const aCrit = a.criterionAverages['crit-creativity'] || 0;
      if (bCrit !== aCrit) return bCrit - aCrit;

      return a.teamName.localeCompare(b.teamName);
    });

    // Assign rank numbers and check for identical ties needing admin review
    let currentRank = 1;
    for (let i = 0; i < list.length; i++) {
      if (i > 0) {
        const prev = list[i - 1];
        const curr = list[i];
        if (
          curr.averageScore === prev.averageScore &&
          curr.criterionAverages['crit-technical'] === prev.criterionAverages['crit-technical'] &&
          curr.criterionAverages['crit-gameplay'] === prev.criterionAverages['crit-gameplay'] &&
          curr.criterionAverages['crit-creativity'] === prev.criterionAverages['crit-creativity']
        ) {
          curr.isTied = true;
          prev.isTied = true;
          curr.tieBreakNote = 'Identical scores across all criteria - Manual Admin Decision Required';
          prev.tieBreakNote = 'Identical scores across all criteria - Manual Admin Decision Required';
        }
      }
      list[i].rank = currentRank;
      currentRank++;
    }

    return list;
  }, [teams, schools, submissions, evaluations, judges, criteria, awards, lang]);

  // Actions implementations
  const updateCompetition = (updates: Partial<Competition>) => {
    setCompetition((prev) => ({ ...prev, ...updates }));
    addAuditLog('Updated Competition Settings', 'تحديث إعدادات المسابقة', 'Competition', competition.id, 'Updated dates or rules.');
  };

  const setCompetitionPhase = (phase: CompetitionStatus) => {
    setCompetition((prev) => ({ ...prev, status: phase }));
    addAuditLog(`Changed Phase to ${phase}`, `تغيير مرحلة المسابقة إلى ${phase}`, 'Competition', competition.id, `Manual phase change to ${phase}`);
    addNotification({
      recipientRole: 'all',
      titleEn: `Competition Phase Updated: ${phase.toUpperCase()}`,
      titleAr: `تم تحديث مرحلة المسابقة إلى: ${phase}`,
      messageEn: `The administrator has moved App Challenge 2026 into the ${phase} phase.`,
      messageAr: `قام مدير المسابقة بنقل تحدي التطبيقات 2026 إلى مرحلة: ${phase}.`,
      type: 'info',
    });
  };

  const registerSchool = (schoolData: Omit<School, 'id' | 'status' | 'submittedAt'>) => {
    const newSchool: School = {
      ...schoolData,
      id: `school-${Date.now()}`,
      status: 'pending',
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    setSchools((prev) => [newSchool, ...prev]);
    addAuditLog('New School Registered', 'تسجيل مدرسة جديدة', 'School', newSchool.id, `Submitted registration for ${newSchool.nameEn}`);
    addNotification({
      recipientRole: 'admin',
      titleEn: 'New School Registration Pending Review',
      titleAr: 'طلب تسجيل مدرسة جديد قيد المراجعة',
      messageEn: `${newSchool.nameEn} submitted a registration request with ${newSchool.expectedTeams} expected teams.`,
      messageAr: `قدمت ${newSchool.nameAr} طلب تسجيل بـ ${newSchool.expectedTeams} فرق متوقعة.`,
      type: 'warning',
    });
    return newSchool;
  };

  const updateSchoolStatus = (schoolId: string, status: SchoolApprovalStatus, feedback?: string) => {
    setSchools((prev) =>
      prev.map((s) =>
        s.id === schoolId
          ? {
              ...s,
              status,
              feedback,
              approvedAt: status === 'approved' ? new Date().toISOString().replace('T', ' ').slice(0, 16) : s.approvedAt,
            }
          : s
      )
    );
    const target = schools.find((s) => s.id === schoolId);
    addAuditLog(
      `School Status: ${status}`,
      `تحديث حالة المدرسة إلى: ${status}`,
      'School',
      schoolId,
      feedback ? `Feedback: ${feedback}` : `Status changed to ${status}`
    );
    if (target) {
      addNotification({
        recipientRole: 'school_rep',
        recipientId: schoolId,
        titleEn: `School Application ${status.toUpperCase()}`,
        titleAr: `تم تحديث حالة تسجيل المدرسة إلى ${status}`,
        messageEn: `Your school registration for App Challenge 2026 is now ${status}. ${feedback || ''}`,
        messageAr: `حالة طلب مدرستكم لتحدي التطبيقات هي الآن ${status}. ${feedback || ''}`,
        type: status === 'approved' ? 'success' : status === 'rejected' ? 'deadline' : 'info',
      });
    }
  };

  const createTeam = (schoolId: string, teamName: string, description: string, mentorName?: string) => {
    const randomCode = `APP26-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const newTeam: Team = {
      id: `team-${Date.now()}`,
      competitionId: competition.id,
      schoolId,
      teamName,
      teamCode: randomCode,
      description,
      mentorName,
      status: 'draft',
      memberIds: [],
      leaderId: '',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    setTeams((prev) => [newTeam, ...prev]);
    addAuditLog('Created Team', 'إنشاء فريق جديد', 'Team', newTeam.id, `Created team ${teamName} with code ${randomCode}`);
    return newTeam;
  };

  const validateTeamCode = (code: string, currentStudentId?: string): TeamValidationResult => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      return {
        valid: false,
        errorType: 'invalid_code',
        errorMessageEn: 'Please enter a team code.',
        errorMessageAr: 'يرجى إدخال رمز الفريق.',
      };
    }

    const targetTeam = teams.find((t) => t.teamCode.toUpperCase() === cleanCode);
    if (!targetTeam) {
      return {
        valid: false,
        errorType: 'invalid_code',
        errorMessageEn: "We couldn't find a team using this code. Please check the code provided by your school.",
        errorMessageAr: 'لم نتمكن من العثور على أي فريق بهذا الرمز. يرجى التحقق من الرمز المزود من مدرستك.',
      };
    }

    const targetSchool = schools.find((s) => s.id === targetTeam.schoolId);

    // Business rule: School must be approved first
    if (targetSchool && targetSchool.status !== 'approved') {
      return {
        valid: false,
        errorType: 'school_unapproved',
        errorMessageEn: `School "${targetSchool.nameEn}" registration has not yet been approved. Students cannot join until school approval is complete.`,
        errorMessageAr: `طلب اعتماد مدرسة "${targetSchool.nameAr}" قيد المراجعة ولم يعتمد بعد. لا يمكن للطلاب الانضمام للفرق قبل اعتماد المدرسة.`,
        team: targetTeam,
        school: targetSchool,
        competition,
      };
    }

    // Business rule: Team must not be withdrawn or rejected
    if (targetTeam.status === 'withdrawn' || targetTeam.status === 'rejected') {
      return {
        valid: false,
        errorType: 'team_unavailable',
        errorMessageEn: 'This team is currently unavailable for registration (withdrawn or locked).',
        errorMessageAr: 'هذا الفريق غير متاح للانضمام حالياً (تم سحبه أو إيقافه).',
        team: targetTeam,
        school: targetSchool,
        competition,
      };
    }

    // Business rule: Registration closed
    if (competition.status === 'registration_closed') {
      return {
        valid: false,
        errorType: 'registration_closed',
        errorMessageEn: 'Team registration for App Challenge 2026 is closed.',
        errorMessageAr: 'تم إغلاق فترة تسجيل الفرق في مسابقة تحدي التطبيقات 2026.',
        team: targetTeam,
        school: targetSchool,
        competition,
      };
    }

    // Business rule: Team capacity limit
    if (targetTeam.memberIds.length >= competition.maxStudentsPerTeam) {
      return {
        valid: false,
        errorType: 'team_full',
        errorMessageEn: `This team has reached the maximum number of participants (${competition.maxStudentsPerTeam}/${competition.maxStudentsPerTeam}). Please contact your school representative.`,
        errorMessageAr: `لقد وصل هذا الفريق إلى الحد الأقصى للأعضاء (${competition.maxStudentsPerTeam}/${competition.maxStudentsPerTeam}). يرجى التواصل مع مشرف مدرستك.`,
        team: targetTeam,
        school: targetSchool,
        competition,
      };
    }

    // Business rule: Student already in a team
    if (currentStudentId) {
      const existingTeam = teams.find((t) => t.memberIds.includes(currentStudentId));
      if (existingTeam) {
        if (existingTeam.id === targetTeam.id) {
          return {
            valid: false,
            errorType: 'already_in_team',
            errorMessageEn: `You are already a registered member of this team (${targetTeam.teamName}).`,
            errorMessageAr: `أنت مسجل بالفعل كعضو في هذا الفريق (${targetTeam.teamName}).`,
            team: targetTeam,
            school: targetSchool,
            competition,
          };
        }
        return {
          valid: false,
          errorType: 'already_in_team',
          errorMessageEn: `You are already registered with another team (${existingTeam.teamName}) in this competition.`,
          errorMessageAr: `أنت مسجل بالفعل في فريق آخر (${existingTeam.teamName}) في هذه المسابقة. لا يمكن الانضمام لأكثر من فريق.`,
          team: targetTeam,
          school: targetSchool,
          competition,
        };
      }
    }

    return {
      valid: true,
      team: targetTeam,
      school: targetSchool,
      competition,
    };
  };

  const joinTeamWithCode = (studentId: string, code: string): { success: boolean; message: string } => {
    const validation = validateTeamCode(code, studentId);
    if (!validation.valid || !validation.team) {
      return {
        success: false,
        message: lang === 'ar' ? (validation.errorMessageAr || 'تعذر الانضمام') : (validation.errorMessageEn || 'Could not join team'),
      };
    }

    const targetTeam = validation.team;
    const cleanCode = code.trim().toUpperCase();

    // Add student
    setTeams((prev) =>
      prev.map((t) =>
        t.id === targetTeam.id
          ? {
              ...t,
              memberIds: [...t.memberIds, studentId],
              leaderId: t.leaderId || studentId,
            }
          : t
      )
    );

    setStudents((prev) =>
      prev.map((st) => (st.id === studentId ? { ...st, teamId: targetTeam.id, schoolId: targetTeam.schoolId } : st))
    );

    addAuditLog('Student Joined Team', 'انضمام طالب للفريق', 'Team', targetTeam.id, `Student ${studentId} joined team ${targetTeam.teamName} via code ${cleanCode}`);

    return {
      success: true,
      message:
        lang === 'ar'
          ? `تم الانضمام بنجاح إلى فريق "${targetTeam.teamName}"!`
          : `Successfully joined team "${targetTeam.teamName}"!`,
    };
  };

  const registerStudentAndJoinTeam = (
    studentData: Omit<Student, 'id' | 'teamId'>,
    teamCode: string
  ): { success: boolean; message: string; student?: Student; team?: Team } => {
    const validation = validateTeamCode(teamCode);
    if (!validation.valid || !validation.team) {
      return {
        success: false,
        message: lang === 'ar' ? (validation.errorMessageAr || 'تعذر الانضمام') : (validation.errorMessageEn || 'Could not join team'),
      };
    }

    const targetTeam = validation.team;
    const newStudentId = `std-new-${Date.now()}`;
    const newStudent: Student = {
      ...studentData,
      id: newStudentId,
      schoolId: targetTeam.schoolId,
      teamId: targetTeam.id,
      isLeader: targetTeam.memberIds.length === 0,
    };

    // Add to students list
    setStudents((prev) => [...prev, newStudent]);

    // Add to team
    setTeams((prev) =>
      prev.map((t) =>
        t.id === targetTeam.id
          ? {
              ...t,
              memberIds: [...t.memberIds, newStudentId],
              leaderId: t.leaderId || newStudentId,
            }
          : t
      )
    );

    // Switch session to student
    setRoleState('student');
    setActivePersonaId(newStudentId);

    addAuditLog(
      'New Student Registered & Joined Team',
      'تسجيل طالب جديد وانضمامه للفريق',
      'Student',
      newStudentId,
      `Student ${studentData.fullName} registered new account and joined team ${targetTeam.teamName}`
    );

    addNotification({
      recipientRole: 'school_rep',
      recipientId: targetTeam.schoolId,
      titleEn: `New Member in ${targetTeam.teamName}`,
      titleAr: `عضو جديد انضم لفريق ${targetTeam.teamName}`,
      messageEn: `${studentData.fullName} joined team ${targetTeam.teamName} (${targetTeam.memberIds.length + 1}/${competition.maxStudentsPerTeam} members).`,
      messageAr: `انضم الطالب ${studentData.fullName} إلى فريق ${targetTeam.teamName} (العدد الحالي: ${targetTeam.memberIds.length + 1} من ${competition.maxStudentsPerTeam}).`,
      type: 'info',
    });

    return {
      success: true,
      message:
        lang === 'ar'
          ? `تم إنشاء حسابك والانضمام بنجاح إلى فريق "${targetTeam.teamName}"!`
          : `Account created and successfully joined team "${targetTeam.teamName}"!`,
      student: newStudent,
      team: targetTeam,
    };
  };

  const loginStudentAndJoinTeam = (
    studentId: string,
    teamCode: string
  ): { success: boolean; message: string; student?: Student; team?: Team } => {
    const validation = validateTeamCode(teamCode, studentId);
    if (!validation.valid || !validation.team) {
      return {
        success: false,
        message: lang === 'ar' ? (validation.errorMessageAr || 'تعذر الانضمام') : (validation.errorMessageEn || 'Could not join team'),
      };
    }

    const targetTeam = validation.team;

    // Add to team
    setTeams((prev) =>
      prev.map((t) =>
        t.id === targetTeam.id
          ? {
              ...t,
              memberIds: [...t.memberIds, studentId],
              leaderId: t.leaderId || studentId,
            }
          : t
      )
    );

    setStudents((prev) =>
      prev.map((st) => (st.id === studentId ? { ...st, teamId: targetTeam.id, schoolId: targetTeam.schoolId } : st))
    );

    // Switch session to this student
    setRoleState('student');
    setActivePersonaId(studentId);

    const std = students.find((s) => s.id === studentId);

    addAuditLog(
      'Student Logged In & Joined Team',
      'تسجيل دخول طالب وانضمامه للفريق',
      'Student',
      studentId,
      `Student ${std?.fullName || studentId} logged in and joined team ${targetTeam.teamName}`
    );

    addNotification({
      recipientRole: 'school_rep',
      recipientId: targetTeam.schoolId,
      titleEn: `New Member in ${targetTeam.teamName}`,
      titleAr: `عضو جديد انضم لفريق ${targetTeam.teamName}`,
      messageEn: `${std?.fullName || 'A student'} joined team ${targetTeam.teamName} (${targetTeam.memberIds.length + 1}/${competition.maxStudentsPerTeam} members).`,
      messageAr: `انضم الطالب ${std?.fullName || 'طالب'} إلى فريق ${targetTeam.teamName} (العدد الحالي: ${targetTeam.memberIds.length + 1} من ${competition.maxStudentsPerTeam}).`,
      type: 'info',
    });

    return {
      success: true,
      message:
        lang === 'ar'
          ? `تم الانضمام بنجاح إلى فريق "${targetTeam.teamName}"!`
          : `Successfully joined team "${targetTeam.teamName}"!`,
      student: std,
      team: targetTeam,
    };
  };

  const removeTeamMember = (teamId: string, studentId: string) => {
    setTeams((prev) =>
      prev.map((t) =>
        t.id === teamId
          ? {
              ...t,
              memberIds: t.memberIds.filter((id) => id !== studentId),
              leaderId: t.leaderId === studentId ? t.memberIds.find((id) => id !== studentId) || '' : t.leaderId,
            }
          : t
      )
    );
    setStudents((prev) =>
      prev.map((st) => (st.id === studentId ? { ...st, teamId: undefined } : st))
    );
    addAuditLog('Removed Team Member', 'استبعاد عضو من الفريق', 'Team', teamId, `Removed student ${studentId}`);
  };

  const submitTeamForApproval = (teamId: string): { success: boolean; message: string } => {
    const targetTeam = teams.find((t) => t.id === teamId);
    if (!targetTeam) return { success: false, message: 'Team not found' };

    if (targetTeam.memberIds.length < competition.minStudentsPerTeam) {
      return {
        success: false,
        message:
          lang === 'ar'
            ? `الحد الأدنى للأعضاء هو ${competition.minStudentsPerTeam} طلاب. لديك حالياً ${targetTeam.memberIds.length} أعضاء.`
            : `Minimum required members is ${competition.minStudentsPerTeam} students. You currently have ${targetTeam.memberIds.length}.`,
      };
    }

    setTeams((prev) =>
      prev.map((t) =>
        t.id === teamId
          ? {
              ...t,
              status: 'pending',
              submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
            }
          : t
      )
    );

    addAuditLog('Team Submitted For Approval', 'إرسال الفريق للاعتماد', 'Team', teamId, `Submitted team ${targetTeam.teamName} for Admin review`);
    addNotification({
      recipientRole: 'admin',
      titleEn: `New Team Submitted: ${targetTeam.teamName}`,
      titleAr: `فريق جديد بانتظار الاعتماد: ${targetTeam.teamName}`,
      messageEn: `Team "${targetTeam.teamName}" has been submitted for approval with ${targetTeam.memberIds.length} members.`,
      messageAr: `تم إرسال فريق "${targetTeam.teamName}" للاعتماد بـ ${targetTeam.memberIds.length} أعضاء.`,
      type: 'info',
    });

    return {
      success: true,
      message:
        lang === 'ar'
          ? 'تم إرسال الفريق للاعتماد بنجاح! سيتم إشعاركم فور تدقيق البيانات.'
          : 'Team submitted for approval! You will be notified once reviewed by the Admin.',
    };
  };

  const updateTeamStatus = (teamId: string, status: TeamStatus, feedback?: string) => {
    setTeams((prev) =>
      prev.map((t) =>
        t.id === teamId
          ? {
              ...t,
              status,
              adminFeedback: feedback,
              approvedAt: status === 'approved' ? new Date().toISOString().replace('T', ' ').slice(0, 16) : t.approvedAt,
            }
          : t
      )
    );
    const target = teams.find((t) => t.id === teamId);
    addAuditLog(`Team Status: ${status}`, `تحديث حالة الفريق إلى: ${status}`, 'Team', teamId, feedback || `Status set to ${status}`);
    if (target) {
      addNotification({
        recipientRole: 'school_rep',
        recipientId: target.schoolId,
        titleEn: `Team "${target.teamName}" status: ${status.toUpperCase()}`,
        titleAr: `حالة فريق "${target.teamName}": ${status}`,
        messageEn: `Your team "${target.teamName}" has been ${status}. ${feedback || ''}`,
        messageAr: `تم تحديث حالة فريقك "${target.teamName}" إلى ${status}. ${feedback || ''}`,
        type: status === 'approved' ? 'success' : 'warning',
      });
    }
  };

  const saveSubmissionDraft = (submission: Partial<GameSubmission> & { teamId: string }) => {
    const existing = submissions.find((s) => s.teamId === submission.teamId);
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    if (existing) {
      setSubmissions((prev) =>
        prev.map((s) => (s.teamId === submission.teamId ? ({ ...s, ...submission, status: 'draft', lastSavedAt: now } as GameSubmission) : s))
      );
    } else {
      const newSub: GameSubmission = {
        id: `sub-${Date.now()}`,
        competitionId: competition.id,
        teamId: submission.teamId,
        schoolId: currentSchool?.id || 'school-al-nahda',
        gameNameEn: submission.gameNameEn || 'Untitled Game',
        gameNameAr: submission.gameNameAr || 'لعبة جديدة',
        shortDescEn: submission.shortDescEn || '',
        shortDescAr: submission.shortDescAr || '',
        fullDescEn: submission.fullDescEn || '',
        fullDescAr: submission.fullDescAr || '',
        genre: submission.genre || 'Action',
        targetPlatform: submission.targetPlatform || 'Web',
        screenshots: submission.screenshots || [],
        status: 'draft',
        currentVersion: 1,
        versions: [],
        lastSavedAt: now,
        ...submission,
      } as GameSubmission;
      setSubmissions((prev) => [newSub, ...prev]);
    }
    addAuditLog('Saved Submission Draft', 'حفظ مسودة تسليم اللعبة', 'GameSubmission', submission.teamId, 'Draft saved by team member.');
  };

  const finalSubmitGame = (submission: Partial<GameSubmission> & { teamId: string }) => {
    const existing = submissions.find((s) => s.teamId === submission.teamId);
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const versionNum = (existing?.currentVersion || 0) + 1;

    const newVersion = {
      versionNumber: versionNum,
      submittedAt: now,
      submittedBy: currentStudent?.fullName || 'Team Member',
      gameNameEn: submission.gameNameEn || existing?.gameNameEn || 'Game',
      gameNameAr: submission.gameNameAr || existing?.gameNameAr || 'لعبة',
      shortDesc: submission.shortDescEn || existing?.shortDescEn || '',
      fullDesc: submission.fullDescEn || existing?.fullDescEn || '',
      genre: submission.genre || existing?.genre || 'Game',
      platform: submission.targetPlatform || existing?.targetPlatform || 'Web',
      webGameUrl: submission.webGameUrl || existing?.webGameUrl,
      buildDownloadUrl: submission.buildDownloadUrl || existing?.buildDownloadUrl,
      videoUrl: submission.gameplayVideoUrl || existing?.gameplayVideoUrl,
      pitchDeckUrl: submission.pitchDeckUrl || existing?.pitchDeckUrl,
      gddUrl: submission.gddDocumentUrl || existing?.gddDocumentUrl,
      screenshots: submission.screenshots || existing?.screenshots || [],
    };

    if (existing) {
      setSubmissions((prev) =>
        prev.map((s) =>
          s.teamId === submission.teamId
            ? ({
                ...s,
                ...submission,
                status: 'submitted',
                currentVersion: versionNum,
                versions: [...s.versions, newVersion],
                lastSavedAt: now,
                finalSubmittedAt: now,
                finalSubmittedBy: currentStudent?.fullName || 'Team Leader',
              } as GameSubmission)
            : s
        )
      );
    } else {
      const newSub: GameSubmission = {
        id: `sub-${Date.now()}`,
        competitionId: competition.id,
        teamId: submission.teamId,
        schoolId: currentSchool?.id || 'school-al-nahda',
        gameNameEn: submission.gameNameEn || 'Game',
        gameNameAr: submission.gameNameAr || 'لعبة',
        shortDescEn: submission.shortDescEn || '',
        shortDescAr: submission.shortDescAr || '',
        fullDescEn: submission.fullDescEn || '',
        fullDescAr: submission.fullDescAr || '',
        genre: submission.genre || 'Game',
        targetPlatform: submission.targetPlatform || 'Web',
        screenshots: submission.screenshots || [],
        status: 'submitted',
        currentVersion: 1,
        versions: [newVersion],
        lastSavedAt: now,
        finalSubmittedAt: now,
        finalSubmittedBy: currentStudent?.fullName || 'Team Leader',
        ...submission,
      } as GameSubmission;
      setSubmissions((prev) => [newSub, ...prev]);
    }

    addAuditLog('Final Game Submitted', 'التسليم النهائي للعبة', 'GameSubmission', submission.teamId, `Submitted Version ${versionNum}. Submission locked.`);
    addNotification({
      recipientRole: 'admin',
      titleEn: `Game Submitted for Judging`,
      titleAr: `تم تسليم لعبة جديدة للتحكيم`,
      messageEn: `Team has submitted their game build (Version ${versionNum}) for evaluation.`,
      messageAr: `قام الفريق بتسليم نسخة لعبتهم (الإصدار ${versionNum}) لجلسات التقييم.`,
      type: 'success',
    });
  };

  const reopenSubmission = (submissionId: string, reason: string) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === submissionId
          ? {
              ...s,
              status: 'changes_requested',
              reopenedAt: now,
              reopenedBy: 'Admin Superuser',
              reopenedReason: reason,
            }
          : s
      )
    );
    addAuditLog('Reopened Game Submission', 'إعادة فتح تسليم لعبة', 'GameSubmission', submissionId, `Reason: ${reason}`);
    addNotification({
      recipientRole: 'student',
      titleEn: 'Submission Reopened by Admin',
      titleAr: 'تمت إعادة فتح تسليم اللعبة بواسطة الإدارة',
      messageEn: `Your game submission was unlocked for updates. Reason: ${reason}`,
      messageAr: `تم فتح تسليم اللعبة لإجراء تعديلات. السبب: ${reason}`,
      type: 'warning',
    });
  };

  const inviteJudge = (judge: Omit<Judge, 'id' | 'assignedTeamIds'>) => {
    const newJudge: Judge = {
      ...judge,
      id: `judge-${Date.now()}`,
      isActive: true,
      assignedTeamIds: [],
    };
    setJudges((prev) => [newJudge, ...prev]);
    addAuditLog('Invited Judge', 'دعوة محكّم جديد', 'Judge', newJudge.id, `Invited ${judge.fullName} (${judge.organization})`);
    addNotification({
      recipientRole: 'judge',
      recipientId: newJudge.id,
      titleEn: 'Welcome to App Challenge Jury Panel',
      titleAr: 'مرحباً بكم في لجنة تحكيم تحدي التطبيقات',
      messageEn: 'You have been added to the official evaluation jury.',
      messageAr: 'تمت إضافتكم رسمياً إلى لجنة التحكيم لتقييم ألعاب المسابقة.',
      type: 'info',
    });
  };

  const toggleJudgeAssignment = (judgeId: string, teamId: string) => {
    setJudges((prev) =>
      prev.map((j) => {
        if (j.id !== judgeId) return j;
        const exists = j.assignedTeamIds.includes(teamId);
        const updated = exists ? j.assignedTeamIds.filter((id) => id !== teamId) : [...j.assignedTeamIds, teamId];
        return { ...j, assignedTeamIds: updated };
      })
    );
    addAuditLog('Toggled Judge Assignment', 'تعديل تعيين المحكم', 'Judge', judgeId, `Toggled assignment for team ${teamId}`);
  };

  const addCriterion = (criterion: Omit<EvaluationCriterion, 'id'>) => {
    const newCrit: EvaluationCriterion = {
      ...criterion,
      id: `crit-${Date.now()}`,
    };
    setCriteria((prev) => [...prev, newCrit]);
    addAuditLog('Added Evaluation Criterion', 'إضافة معيار تقييم', 'Criterion', newCrit.id, `Added ${criterion.nameEn} (${criterion.maxScore} pts)`);
  };

  const updateCriterion = (id: string, updates: Partial<EvaluationCriterion>) => {
    setCriteria((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    addAuditLog('Updated Evaluation Criterion', 'تعديل معيار تقييم', 'Criterion', id, 'Updated score weights or descriptions.');
  };

  const deleteCriterion = (id: string) => {
    setCriteria((prev) => prev.filter((c) => c.id !== id));
    addAuditLog('Deleted Evaluation Criterion', 'حذف معيار تقييم', 'Criterion', id, 'Removed criterion from rubric.');
  };

  const saveEvaluationDraft = (evaluation: Partial<JudgeEvaluation> & { teamId: string; judgeId: string }) => {
    const existing = evaluations.find((e) => e.teamId === evaluation.teamId && e.judgeId === evaluation.judgeId);
    const total = (evaluation.scores || []).reduce((sum, s) => sum + (s.score || 0), 0);
    if (existing) {
      setEvaluations((prev) =>
        prev.map((e) =>
          e.id === existing.id ? ({ ...e, ...evaluation, totalScore: total, status: 'draft' } as JudgeEvaluation) : e
        )
      );
    } else {
      const newEval: JudgeEvaluation = {
        id: `eval-${Date.now()}`,
        competitionId: competition.id,
        teamId: evaluation.teamId,
        judgeId: evaluation.judgeId,
        scores: evaluation.scores || [],
        totalScore: total,
        strengths: evaluation.strengths || '',
        areasForImprovement: evaluation.areasForImprovement || '',
        recommendations: evaluation.recommendations,
        status: 'draft',
      };
      setEvaluations((prev) => [newEval, ...prev]);
    }
  };

  const submitEvaluation = (evaluation: Partial<JudgeEvaluation> & { teamId: string; judgeId: string }) => {
    const existing = evaluations.find((e) => e.teamId === evaluation.teamId && e.judgeId === evaluation.judgeId);
    const total = (evaluation.scores || []).reduce((sum, s) => sum + (s.score || 0), 0);
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

    if (existing) {
      setEvaluations((prev) =>
        prev.map((e) =>
          e.id === existing.id
            ? ({
                ...e,
                ...evaluation,
                totalScore: total,
                status: 'submitted',
                submittedAt: now,
              } as JudgeEvaluation)
            : e
        )
      );
    } else {
      const newEval: JudgeEvaluation = {
        id: `eval-${Date.now()}`,
        competitionId: competition.id,
        teamId: evaluation.teamId,
        judgeId: evaluation.judgeId,
        scores: evaluation.scores || [],
        totalScore: total,
        strengths: evaluation.strengths || '',
        areasForImprovement: evaluation.areasForImprovement || '',
        recommendations: evaluation.recommendations,
        status: 'submitted',
        submittedAt: now,
      };
      setEvaluations((prev) => [newEval, ...prev]);
    }

    addAuditLog('Submitted Evaluation', 'تسليم تقييم محكّم', 'JudgeEvaluation', evaluation.teamId, `Judge ${evaluation.judgeId} scored ${total}/100. Evaluation locked.`);
    addNotification({
      recipientRole: 'admin',
      titleEn: 'Judge Completed Game Evaluation',
      titleAr: 'أكمل محكّم تقييم لعبة',
      messageEn: `Evaluation submitted with total score ${total}/100.`,
      messageAr: `تم استلام تقييم محكم بمجموع درجات ${total}/100.`,
      type: 'info',
    });
  };

  const unlockEvaluation = (evaluationId: string, reason: string) => {
    setEvaluations((prev) =>
      prev.map((e) =>
        e.id === evaluationId
          ? {
              ...e,
              status: 'draft',
              isUnlocked: true,
              unlockedBy: 'Admin Superuser',
              unlockedReason: reason,
            }
          : e
      )
    );
    addAuditLog('Unlocked Judge Evaluation', 'إلغاء قفل تقييم محكم', 'JudgeEvaluation', evaluationId, `Reason: ${reason}`);
  };

  const toggleBlindEvaluation = () => {
    const nextState = !competition.blindEvaluationEnabled;
    setCompetition((prev) => ({ ...prev, blindEvaluationEnabled: nextState }));
    addAuditLog('Toggled Blind Evaluation', 'تبديل التحكيم الأعمى', 'Competition', competition.id, `Set blind evaluation to ${nextState}`);
  };

  const setResultsVisibility = (visibility: ResultsVisibility) => {
    setCompetition((prev) => ({ ...prev, resultsVisibility: visibility }));
    addAuditLog(`Results Visibility: ${visibility}`, `تغيير ظهور النتائج إلى: ${visibility}`, 'Competition', competition.id, `Status set to ${visibility}`);
    if (visibility === 'published') {
      addNotification({
        recipientRole: 'all',
        titleEn: 'App Challenge 2026 Results Published!',
        titleAr: 'تم إعلان ونشر نتائج تحدي التطبيقات 2026 رسمياً!',
        messageEn: 'The official rankings and award winners are now publicly visible on the results portal.',
        messageAr: 'أصبحت الترتيبات الرسمية وأسماء الفائزين بالجوائز معروضة للعامة في بوابة النتائج.',
        type: 'success',
      });
    }
  };

  const assignAward = (awardId: string, teamId: string | undefined) => {
    setAwards((prev) => prev.map((a) => (a.id === awardId ? { ...a, assignedTeamId: teamId } : a)));
    addAuditLog('Assigned Winner Award', 'تخصيص جائزة لفريق', 'WinnerAward', awardId, `Assigned to team ${teamId || 'None'}`);
  };

  const addCustomAward = (award: Omit<WinnerAward, 'id'>) => {
    const newAward: WinnerAward = {
      ...award,
      id: `award-${Date.now()}`,
      isCustomCategory: true,
    };
    setAwards((prev) => [...prev, newAward]);
    addAuditLog('Created Custom Award Category', 'إنشاء فئة جائزة مخصصة', 'WinnerAward', newAward.id, `Created award: ${award.titleEn}`);
  };

  const resetToDefaults = () => {
    localStorage.clear();
    setCompetition(INITIAL_COMPETITION);
    setSchools(INITIAL_SCHOOLS);
    setStudents(INITIAL_STUDENTS);
    setTeams(INITIAL_TEAMS);
    setStudentProgress(INITIAL_STUDENT_PROGRESS);
    setSubmissions(INITIAL_SUBMISSIONS);
    setCriteria(INITIAL_CRITERIA);
    setJudges(INITIAL_JUDGES);
    setEvaluations(INITIAL_EVALUATIONS);
    setAwards(INITIAL_AWARDS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setRole('admin');
  };

  const t = lang === 'ar' ? translations.ar : translations.en;

  return (
    <CompetitionContext.Provider
      value={{
        lang,
        setLang,
        t,
        role,
        setRole,
        activePersonaId,
        setActivePersonaId,
        competition,
        schools,
        students,
        teams,
        lmsCourse,
        studentProgress,
        submissions,
        criteria,
        judges,
        evaluations,
        awards,
        notifications,
        auditLogs,
        teamSummaries,
        currentSchool,
        currentStudent,
        currentTeam,
        currentJudge,
        updateCompetition,
        setCompetitionPhase,
        registerSchool,
        updateSchoolStatus,
        createTeam,
        validateTeamCode,
        joinTeamWithCode,
        registerStudentAndJoinTeam,
        loginStudentAndJoinTeam,
        removeTeamMember,
        submitTeamForApproval,
        updateTeamStatus,
        saveSubmissionDraft,
        finalSubmitGame,
        reopenSubmission,
        inviteJudge,
        toggleJudgeAssignment,
        addCriterion,
        updateCriterion,
        deleteCriterion,
        saveEvaluationDraft,
        submitEvaluation,
        unlockEvaluation,
        toggleBlindEvaluation,
        setResultsVisibility,
        assignAward,
        addCustomAward,
        addAuditLog,
        markNotificationRead,
        markAllNotificationsRead,
        resetToDefaults,
      }}
    >
      {children}
    </CompetitionContext.Provider>
  );
};

export const useCompetition = () => {
  const context = useContext(CompetitionContext);
  if (!context) {
    throw new Error('useCompetition must be used within a CompetitionProvider');
  }
  return context;
};

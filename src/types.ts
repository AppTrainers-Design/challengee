export type Language = 'en' | 'ar';

export type SystemRole = 'admin' | 'school_rep' | 'student' | 'instructor' | 'judge' | 'public';

export type CompetitionStatus =
  | 'draft'
  | 'upcoming'
  | 'registration_open'
  | 'registration_closed'
  | 'training'
  | 'development'
  | 'submission_closed'
  | 'evaluation'
  | 'results_pending'
  | 'completed';

export type SchoolType = 'public' | 'private' | 'other';

export type SchoolApprovalStatus = 'pending' | 'approved' | 'rejected' | 'changes_requested';

export type TeamStatus = 'draft' | 'pending' | 'changes_requested' | 'approved' | 'rejected' | 'withdrawn';

export type SubmissionStatus =
  | 'not_started'
  | 'draft'
  | 'submitted'
  | 'changes_requested'
  | 'resubmitted'
  | 'locked';

export type ResultsVisibility = 'hidden' | 'internal_review' | 'published';

export type EvaluationStatus = 'not_started' | 'draft' | 'submitted';

export interface Competition {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  year: number;
  coverImage: string;
  status: CompetitionStatus;
  isPublished: boolean;
  registrationStartDate: string;
  registrationEndDate: string;
  trainingStartDate: string;
  trainingEndDate: string;
  developmentStartDate: string;
  submissionDeadline: string;
  evaluationStartDate: string;
  evaluationEndDate: string;
  resultsAnnouncementDate: string;
  maxTeamsPerSchool: number;
  minStudentsPerTeam: number;
  maxStudentsPerTeam: number;
  rulesEn: string;
  rulesAr: string;
  eligibilityEn: string;
  eligibilityAr: string;
  submissionRequirementsEn: string;
  submissionRequirementsAr: string;
  termsEn: string;
  termsAr: string;
  blindEvaluationEnabled: boolean;
  resultsVisibility: ResultsVisibility;
  linkedCourseId?: string;
  submissionEditPermission: 'all_members' | 'team_leader_only';
}

export interface School {
  id: string;
  competitionId: string;
  nameAr: string;
  nameEn: string;
  schoolType: SchoolType;
  governorate: string;
  cityArea: string;
  address: string;
  phone: string;
  email: string;
  representativeName: string;
  representativeJobTitle: string;
  representativeEmail: string;
  representativeMobile: string;
  expectedTeams: number;
  expectedStudents: number;
  status: SchoolApprovalStatus;
  submittedAt: string;
  approvedAt?: string;
  feedback?: string;
}

export interface Student {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  dateOfBirth: string;
  age: number;
  gender: 'male' | 'female';
  nationality: string;
  nationalId: string;
  schoolId: string;
  grade: string;
  guardianName: string;
  guardianMobile: string;
  teamId?: string;
  isLeader?: boolean;
}

export interface Team {
  id: string;
  competitionId: string;
  schoolId: string;
  teamName: string;
  teamCode: string;
  description: string;
  logo?: string;
  mentorName?: string;
  status: TeamStatus;
  memberIds: string[];
  leaderId: string;
  createdAt: string;
  submittedAt?: string;
  approvedAt?: string;
  adminFeedback?: string;
  submissionId?: string;
}

export interface LMSSession {
  id: string;
  titleEn: string;
  titleAr: string;
  dayNumber: number;
  duration: string;
  type: 'online' | 'onsite' | 'recorded';
  videoUrl?: string;
  pdfMaterialUrl?: string;
  assignmentTitle?: string;
  quizTitle?: string;
}

export interface LMSCourse {
  id: string;
  competitionId: string;
  titleEn: string;
  titleAr: string;
  instructorName: string;
  instructorEmail: string;
  descriptionEn: string;
  descriptionAr: string;
  durationDays: number;
  sessions: LMSSession[];
}

export interface StudentTrainingProgress {
  studentId: string;
  teamId: string;
  schoolId: string;
  attendanceRate: number; // percentage 0-100
  completedSessions: number;
  totalSessions: number;
  assignmentsCompleted: number;
  totalAssignments: number;
  quizScore: number; // percentage 0-100
  status: 'not_started' | 'in_progress' | 'completed';
}

export interface SubmissionVersion {
  versionNumber: number;
  submittedAt: string;
  submittedBy: string;
  gameNameEn: string;
  gameNameAr: string;
  shortDesc: string;
  fullDesc: string;
  genre: string;
  platform: string;
  webGameUrl?: string;
  buildDownloadUrl?: string;
  videoUrl?: string;
  pitchDeckUrl?: string;
  gddUrl?: string;
  screenshots: string[];
  logoUrl?: string;
}

export interface GameSubmission {
  id: string;
  competitionId: string;
  teamId: string;
  schoolId: string;
  gameNameEn: string;
  gameNameAr: string;
  shortDescEn: string;
  shortDescAr: string;
  fullDescEn: string;
  fullDescAr: string;
  genre: string;
  targetPlatform: 'Windows' | 'Android' | 'iOS' | 'Web' | 'Cross-Platform';
  logoUrl?: string;
  coverImageUrl?: string;
  screenshots: string[];
  gameplayVideoUrl?: string;
  webGameUrl?: string;
  buildDownloadUrl?: string;
  buildFileType?: 'APK' | 'ZIP' | 'EXE' | 'WebURL';
  pitchDeckUrl?: string;
  gddDocumentUrl?: string;
  status: SubmissionStatus;
  currentVersion: number;
  versions: SubmissionVersion[];
  lastSavedAt: string;
  finalSubmittedAt?: string;
  finalSubmittedBy?: string;
  reopenedAt?: string;
  reopenedBy?: string;
  reopenedReason?: string;
}

export interface Judge {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  organization: string;
  jobTitle: string;
  specialization: string;
  biography?: string;
  isActive: boolean;
  assignedTeamIds: string[];
}

export interface EvaluationCriterion {
  id: string;
  competitionId: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  maxScore: number;
  weight: number;
  isRequired: boolean;
  displayOrder: number;
}

export interface CriterionScore {
  criterionId: string;
  score: number;
  comment?: string;
}

export interface JudgeEvaluation {
  id: string;
  competitionId: string;
  teamId: string;
  judgeId: string;
  scores: CriterionScore[];
  totalScore: number;
  strengths: string;
  areasForImprovement: string;
  recommendations?: string;
  status: EvaluationStatus;
  submittedAt?: string;
  isUnlocked?: boolean;
  unlockedBy?: string;
  unlockedReason?: string;
}

export interface TeamScoreSummary {
  teamId: string;
  teamName: string;
  schoolId: string;
  schoolName: string;
  gameName: string;
  assignedJudgesCount: number;
  completedEvaluationsCount: number;
  evaluations: JudgeEvaluation[];
  averageScore: number;
  individualScores: number[];
  criterionAverages: Record<string, number>;
  rank: number;
  isDisqualified?: boolean;
  isTied?: boolean;
  tieBreakNote?: string;
  awardedCategory?: string;
}

export interface WinnerAward {
  id: string;
  competitionId: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  icon: string;
  assignedTeamId?: string;
  isCustomCategory?: boolean;
}

export interface NotificationItem {
  id: string;
  recipientRole: SystemRole | 'all';
  recipientId?: string;
  titleEn: string;
  titleAr: string;
  messageEn: string;
  messageAr: string;
  timestamp: string;
  isRead: boolean;
  type: 'info' | 'success' | 'warning' | 'deadline';
  linkTarget?: string;
}

export interface AuditLogItem {
  id: string;
  userName: string;
  role: SystemRole;
  action: string;
  actionAr: string;
  entityType: string;
  entityId: string;
  details: string;
  timestamp: string;
}

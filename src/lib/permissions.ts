import { UserRole } from '@/types';

export const ROLE_LABELS: Record<UserRole, string> = {
  student: 'Student',
  faculty: 'Faculty Member',
  add_hod: 'Additional HOD',
  hod: 'Head of Department (HOD)',
  dean: 'Dean of Academic / Student Affairs',
  joint_registrar: 'Joint Registrar (Operations)',
  registrar: 'University Registrar',
  staff: 'Facilities Staff',
  security: 'Security Officer',
  admin: 'System Administrator',
};

export const ROLE_HIERARCHY_LEVEL: Record<UserRole, number> = {
  student: 1,
  faculty: 2,
  staff: 2,
  security: 3,
  add_hod: 3,
  hod: 4,
  dean: 5,
  joint_registrar: 6,
  registrar: 7,
  admin: 7,
};

export const ROLE_BADGE_COLORS: Record<UserRole, { bg: string; text: string; border: string }> = {
  student: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' },
  faculty: { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
  add_hod: { bg: 'bg-cyan-50 dark:bg-cyan-950/40', text: 'text-cyan-700 dark:text-cyan-400', border: 'border-cyan-200 dark:border-cyan-800' },
  hod: { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' },
  dean: { bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-700 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-800' },
  joint_registrar: { bg: 'bg-violet-50 dark:bg-violet-950/40', text: 'text-violet-700 dark:text-violet-400', border: 'border-violet-200 dark:border-violet-800' },
  registrar: { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-800' },
  staff: { bg: 'bg-orange-50 dark:bg-orange-950/40', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800' },
  security: { bg: 'bg-red-50 dark:bg-red-950/40', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-800' },
  admin: { bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-700 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800' },
};

// Responsible RBAC Access Evaluators
export const canManageGrievances = (role: UserRole): boolean => {
  return ['faculty', 'add_hod', 'hod', 'dean', 'joint_registrar', 'registrar', 'staff', 'admin'].includes(role);
};

export const canEscalateToHod = (role: UserRole): boolean => {
  return ['faculty', 'add_hod', 'staff'].includes(role);
};

export const canEscalateToDean = (role: UserRole): boolean => {
  return ['hod', 'add_hod'].includes(role);
};

export const canEscalateToRegistrar = (role: UserRole): boolean => {
  return ['dean', 'joint_registrar'].includes(role);
};

export const canFinalizeGrievance = (role: UserRole): boolean => {
  return ['hod', 'dean', 'joint_registrar', 'registrar', 'admin'].includes(role);
};

export const canApproveBookings = (role: UserRole): boolean => {
  return ['add_hod', 'hod', 'dean', 'joint_registrar', 'registrar', 'staff', 'admin'].includes(role);
};

export const canApproveAuditoriumAndGrandHalls = (role: UserRole): boolean => {
  return ['dean', 'joint_registrar', 'registrar', 'admin'].includes(role);
};

export const canManageMaintenance = (role: UserRole): boolean => {
  return ['add_hod', 'hod', 'joint_registrar', 'registrar', 'staff', 'admin'].includes(role);
};

export const canManageIncidents = (role: UserRole): boolean => {
  return ['security', 'joint_registrar', 'registrar', 'admin'].includes(role);
};

export const canBroadcastAnnouncements = (role: UserRole): boolean => {
  return ['faculty', 'add_hod', 'hod', 'dean', 'joint_registrar', 'registrar', 'admin'].includes(role);
};

export const canBroadcastUniversityWide = (role: UserRole): boolean => {
  return ['dean', 'joint_registrar', 'registrar', 'admin'].includes(role);
};

export const canViewAuditAnalytics = (role: UserRole): boolean => {
  return ['add_hod', 'hod', 'dean', 'joint_registrar', 'registrar', 'admin'].includes(role);
};

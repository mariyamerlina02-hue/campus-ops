export type UserRole = 
  | 'student' 
  | 'faculty' 
  | 'add_hod' 
  | 'hod' 
  | 'dean' 
  | 'joint_registrar' 
  | 'registrar' 
  | 'staff' 
  | 'security' 
  | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  roleTitle?: string;
  department: string;
  studentOrEmployeeId: string;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
}

export type GrievanceCategory = 
  | 'academic'
  | 'infrastructure'
  | 'hostel'
  | 'cafeteria'
  | 'finance'
  | 'harassment'
  | 'security'
  | 'other';

export type GrievancePriority = 'low' | 'medium' | 'high' | 'critical';

export type GrievanceStatus = 
  | 'submitted'
  | 'under_review'
  | 'in_progress'
  | 'escalated_to_hod'
  | 'escalated_to_dean'
  | 'escalated_to_registrar'
  | 'resolved'
  | 'rejected';

export interface GrievanceComment {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  text: string;
  createdAt: string;
  isStaffOnly?: boolean;
}

export interface Grievance {
  id: string;
  title: string;
  description: string;
  category: GrievanceCategory;
  priority: GrievancePriority;
  status: GrievanceStatus;
  location: string;
  department?: string;
  isAnonymous: boolean;
  submitterId: string;
  submitterName: string;
  submitterRole: UserRole;
  assignedTo?: string;
  assignedName?: string;
  resolutionNotes?: string;
  escalationLevel?: 'department' | 'school' | 'university_executive';
  upvotes: string[];
  comments: GrievanceComment[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export type ResourceType = 'auditorium' | 'hall' | 'lab' | 'sports' | 'conference' | 'equipment';

export interface CampusResource {
  id: string;
  name: string;
  code: string;
  type: ResourceType;
  building: string;
  floor: string;
  capacity: number;
  available: boolean;
  requiresDeanApproval?: boolean;
  requiresRegistrarApproval?: boolean;
  amenities: string[];
  imageUrl: string;
}

export type BookingStatus = 
  | 'pending' 
  | 'recommended_by_faculty'
  | 'approved_by_hod' 
  | 'approved' 
  | 'rejected' 
  | 'cancelled';

export interface ResourceBooking {
  id: string;
  resourceId: string;
  resourceName: string;
  userId: string;
  userName: string;
  userRole?: UserRole;
  department?: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  attendeesCount: number;
  status: BookingStatus;
  approvedBy?: string;
  approverRole?: UserRole;
  remarks?: string;
  createdAt: string;
}

export type MaintenancePriority = 'low' | 'medium' | 'urgent';
export type MaintenanceStatus = 'reported' | 'verified_by_hod' | 'assigned' | 'in_progress' | 'resolved';

export interface MaintenanceTicket {
  id: string;
  title: string;
  description: string;
  building: string;
  roomNumber: string;
  category: 'electrical' | 'plumbing' | 'hvac' | 'furniture' | 'network' | 'other';
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  reportedBy: string;
  reporterName: string;
  reporterRole?: UserRole;
  assignedTechnician?: string;
  estimatedCost?: number;
  completionNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export type IncidentSeverity = 'low' | 'moderate' | 'high' | 'critical_sos';
export type IncidentType = 'security' | 'medical' | 'fire' | 'theft' | 'trespassing' | 'assault' | 'hazard' | 'other';
export type IncidentStatus = 'open' | 'dispatched' | 'investigating' | 'resolved';

export interface SecurityIncident {
  id: string;
  title: string;
  description: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  location: string;
  coordinates?: { lat: number; lng: number };
  isEmergencySos: boolean;
  reporterId: string;
  reporterName: string;
  anonymous: boolean;
  respondingUnit?: string;
  actionTaken?: string;
  incidentCommander?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface CampusAnnouncement {
  id: string;
  title: string;
  content: string;
  targetRoles: UserRole[];
  authorId: string;
  authorName: string;
  authorRole: string;
  priority: 'normal' | 'urgent';
  tags: string[];
  createdAt: string;
}

export interface CampusNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'alert' | 'success' | 'warning';
  read: boolean;
  link?: string;
  createdAt: string;
}

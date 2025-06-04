export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export enum TaskStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  FAILED = 'Failed',
}

export interface AITask {
  id: string;
  title: string;
  description: string;
  assignedTo: string; // e.g., "Email Automation Bot", "Candidate Sourcing AI"
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  platform: string; // e.g., "LinkedIn", "Internal Referral"
  role: string;
  status: 'Sourced' | 'Screening' | 'Interviewing' | 'Offered' | 'Hired' | 'Rejected';
}

export interface JobPosting {
  id: string;
  title: string;
  department: string;
  description: string;
  status: 'Draft' | 'Open' | 'Closed';
  postedAt?: Date;
}

export interface CompanyPolicy {
  id: string;
  title: string;
  category: string;
  contentSnippet: string; // A short preview
  // fullContentUrl: string; // Link to full document if applicable
}

export interface OnboardingItem {
  id: string;
  task: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Requires Attention';
  assignee: string; // e.g. New Hire, HR Manager
  dueDate?: Date;
}

export interface SummarizedEmail {
  id: string;
  originalSender: string;
  originalSubject: string;
  receivedDate: Date;
  summary: string;
  aiSentiment?: 'Positive' | 'Negative' | 'Neutral';
  aiCategory?: string; // e.g., "Leave Request", "Feedback", "Benefit Inquiry", "Payroll Query"
}

export type OffboardingCaseType = 'Resignation' | 'Termination' | 'PIP';
export type OffboardingStatus = 'Initiated' | 'Pending Exit Interview' | 'Pending Final Settlement' | 'PIP Active' | 'PIP Review Pending' | 'Closed' | 'Requires Attention';

export interface OffboardingCase {
  id: string;
  employeeName: string;
  employeeId: string;
  type: OffboardingCaseType;
  status: OffboardingStatus;
  initiatedDate: Date;
  lastWorkingDay?: Date; // For Resignation/Termination
  pipReviewDate?: Date; // For PIP
  reason?: string; // For Resignation/Termination
  manager?: string; // For PIPs or direct manager for separation
  nextStep?: string;
}

export type SubscriptionTier = 'Basic' | 'Pro' | 'Enterprise' | 'Trial';
export type SubscriptionStatus = 'Active' | 'Trialing' | 'Past Due' | 'Canceled';

export interface User {
  id: string;
  email: string;
  name?: string; 
  subscriptionTier?: SubscriptionTier;
  isAdmin?: boolean; // Added for admin role
}

export interface ClientSubscription {
  id: string;
  clientName: string;
  clientEmail: string;
  plan: SubscriptionTier;
  status: SubscriptionStatus;
  joinedDate: Date;
  renewalDate?: Date;
}

export type SupportQueryStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';

export interface SupportQuery {
  id: string;
  clientId: string; // Links to ClientSubscription's client (e.g. by email or a dedicated ID)
  clientName: string; // Denormalized for easy display
  subject: string;
  description: string;
  submittedDate: Date;
  lastUpdatedDate: Date;
  status: SupportQueryStatus;
  assignedTo?: string; // e.g., "AI Support Bot", "Tier 1 Agent"
  priority?: 'Low' | 'Medium' | 'High';
}


export type ActiveView = 
  | 'dashboard' 
  | 'queryResolution' 
  | 'aiWorkerMonitor' 
  | 'candidateSourcing' 
  | 'jobPosting' 
  | 'policyCenter' 
  | 'onboardingTracker'
  | 'emailAutomation'
  | 'offerManagement'
  | 'emailSummaries'
  | 'offboardingManagement'
  | 'billing'
  | 'adminDashboard'; // Added new view type for Admin Dashboard
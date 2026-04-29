export type UserRole = 'admin' | 'user';
export type FieldType = 'text' | 'file' | 'date' | 'dropdown' | 'number';
export type SubmissionStatus = 'not_started' | 'pending' | 'submitted' | 'late';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  mobile: string;
  office: string;
  division?: string;
  number: string;
  role: UserRole;
  assignedTemplates: string[];
  createdAt: string;
  password: string;
}

export interface TemplateField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[];
  order: number;
}

export interface ReportTemplate {
  id: string;
  title: string;
  shortCode: string;
  fields: TemplateField[];
  deadline: string;
  // deadlineDay: ISO date format (e.g., "2026-04-30") for specific dates
  // or null for recurring deadlines (handled by deadline string)
  deadlineDate?: string | null;
  createdAt: string;
}

export interface Submission {
  id: string;
  userId: string;
  templateId: string;
  status: SubmissionStatus;
  submissionDate: string | null;
  month: number;
  year: number;
  data: Record<string, string>;
}

export interface AppNotification {
  id: string;
  userId: string;
  message: string;
  type: 'deadline' | 'missing' | 'submitted' | 'late';
  read: boolean;
  createdAt: string;
}

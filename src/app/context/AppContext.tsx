import React, { createContext, useContext, useState, useCallback } from 'react';
import type { AppUser, ReportTemplate, Submission, AppNotification, TemplateField, SubmissionStatus } from '../types';
import { mockUsers, mockTemplates, mockSubmissions, mockNotifications } from '../data/mockData';

// ─── Backend Integration Note ──────────────────────────────────────────────
// In production, replace all useState initializers and CRUD functions
// with API calls to your backend (e.g., Supabase, REST API, or GraphQL).
// Tables: users, report_templates, report_components, submissions, submission_data
// ───────────────────────────────────────────────────────────────────────────

interface AppContextType {
  // Auth
  currentUser: AppUser | null;
  login: (name: string, office: string, password: string, role: 'admin' | 'user', division?: string) => AppUser | null;
  signup: (name: string, office: string, password: string, role: 'admin' | 'user', division?: string) => AppUser;
  logout: () => void;

  // Users
  users: AppUser[];
  addUser: (user: Omit<AppUser, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<AppUser>) => void;
  deleteUser: (id: string) => void;
  importUsers: (users: Omit<AppUser, 'id' | 'createdAt'>[]) => void;

  // Templates
  templates: ReportTemplate[];
  addTemplate: (template: Omit<ReportTemplate, 'id' | 'createdAt'>) => void;
  updateTemplate: (id: string, updates: Partial<ReportTemplate>) => void;
  deleteTemplate: (id: string) => void;

  // Submissions
  submissions: Submission[];
  addSubmission: (submission: Omit<Submission, 'id'>) => void;
  updateSubmission: (id: string, updates: Partial<Submission>) => void;
  getSubmissionForUser: (userId: string, templateId: string, month: number, year: number) => Submission | undefined;

  // Notifications
  notifications: AppNotification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (userId: string) => void;
  getUnreadCount: (userId: string) => number;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [users, setUsers] = useState<AppUser[]>(mockUsers);
  const [templates, setTemplates] = useState<ReportTemplate[]>(mockTemplates);
  const [submissions, setSubmissions] = useState<Submission[]>(mockSubmissions);
  const [notifications, setNotifications] = useState<AppNotification[]>(mockNotifications);

  // ─── Auth ────────────────────────────────────────────────────────────────
  // Backend: POST /api/auth/login → returns JWT + user profile
  const login = useCallback((name: string, office: string, password: string, role: 'admin' | 'user', division?: string) => {
    const found = users.find(
      u => u.name.toLowerCase() === name.toLowerCase() &&
           u.office === office &&
           u.password === password &&
           u.role === role &&
           (division ? u.division === division : true)
    );
    if (found) {
      setCurrentUser(found);
      return found;
    }
    return null;
  }, [users]);

  const signup = useCallback((name: string, office: string, password: string, role: 'admin' | 'user', division?: string) => {
    const nextNumber = Math.max(0, ...users.map(u => parseInt(u.number, 10)).filter(n => !isNaN(n))) + 1;
    const newUser: AppUser = {
      id: `user-${Date.now()}`,
      name,
      office,
      division,
      number: nextNumber.toString().padStart(3, '0'),
      role,
      assignedTemplates: [],
      createdAt: new Date().toISOString().split('T')[0],
      password,
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    return newUser;
  }, [users]);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  // ─── Users ───────────────────────────────────────────────────────────────
  // Backend: GET /api/users, POST /api/users, PATCH /api/users/:id, DELETE /api/users/:id
  const addUser = useCallback((user: Omit<AppUser, 'id' | 'createdAt'>) => {
    const newUser: AppUser = {
      ...user,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setUsers(prev => [...prev, newUser]);
  }, []);

  const updateUser = useCallback((id: string, updates: Partial<AppUser>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  }, []);

  const deleteUser = useCallback((id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  }, []);

  const importUsers = useCallback((newUsers: Omit<AppUser, 'id' | 'createdAt'>[]) => {
    const created = newUsers.map((u, i) => ({
      ...u,
      id: `user-import-${Date.now()}-${i}`,
      createdAt: new Date().toISOString().split('T')[0],
    }));
    setUsers(prev => [...prev, ...created]);
  }, []);

  // ─── Templates ───────────────────────────────────────────────────────────
  // Backend: GET /api/templates, POST /api/templates, PATCH /api/templates/:id, DELETE /api/templates/:id
  // Also manages report_components table per template
  const addTemplate = useCallback((template: Omit<ReportTemplate, 'id' | 'createdAt'>) => {
    const newTemplate: ReportTemplate = {
      ...template,
      id: `tpl-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTemplates(prev => [...prev, newTemplate]);
  }, []);

  const updateTemplate = useCallback((id: string, updates: Partial<ReportTemplate>) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const deleteTemplate = useCallback((id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  }, []);

  // ─── Submissions ─────────────────────────────────────────────────────────
  // Backend: GET /api/submissions, POST /api/submissions, PATCH /api/submissions/:id
  // Also manages submission_data table per submission
  const addSubmission = useCallback((submission: Omit<Submission, 'id'>) => {
    const newSub: Submission = { ...submission, id: `sub-${Date.now()}` };
    setSubmissions(prev => {
      const existing = prev.find(s =>
        s.userId === submission.userId &&
        s.templateId === submission.templateId &&
        s.month === submission.month &&
        s.year === submission.year
      );
      if (existing) {
        return prev.map(s => s.id === existing.id ? { ...s, ...newSub, id: s.id } : s);
      }
      return [...prev, newSub];
    });
  }, []);

  const updateSubmission = useCallback((id: string, updates: Partial<Submission>) => {
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  const getSubmissionForUser = useCallback((userId: string, templateId: string, month: number, year: number) => {
    return submissions.find(s =>
      s.userId === userId &&
      s.templateId === templateId &&
      s.month === month &&
      s.year === year
    );
  }, [submissions]);

  // ─── Notifications ───────────────────────────────────────────────────────
  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllNotificationsRead = useCallback((userId: string) => {
    setNotifications(prev => prev.map(n => n.userId === userId ? { ...n, read: true } : n));
  }, []);

  const getUnreadCount = useCallback((userId: string) => {
    return notifications.filter(n => n.userId === userId && !n.read).length;
  }, [notifications]);

  return (
    <AppContext.Provider value={{
      currentUser, login, signup, logout,
      users, addUser, updateUser, deleteUser, importUsers,
      templates, addTemplate, updateTemplate, deleteTemplate,
      submissions, addSubmission, updateSubmission, getSubmissionForUser,
      notifications, markNotificationRead, markAllNotificationsRead, getUnreadCount,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

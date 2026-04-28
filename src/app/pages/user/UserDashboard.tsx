import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../../context/AppContext';
import { MONTHS } from '../../data/mockData';
import {
  FileText, CheckCircle, Clock, AlertTriangle,
  ChevronRight, Calendar, Minus, Bell
} from 'lucide-react';

const CURRENT_MONTH = 4;
const CURRENT_YEAR = 2026;

const STATUS_CONFIG = {
  submitted: { label: 'Submitted', cls: 'bg-green-100 text-green-700 border-green-200', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  pending: { label: 'Pending', cls: 'bg-amber-100 text-amber-700 border-amber-200', icon: <Clock className="w-3.5 h-3.5" /> },
  not_started: { label: 'Not Started', cls: 'bg-gray-100 text-gray-500 border-gray-200', icon: <Minus className="w-3.5 h-3.5" /> },
  late: { label: 'Overdue', cls: 'bg-red-100 text-red-700 border-red-200', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
};

export default function UserDashboard() {
  const { currentUser, templates, submissions, notifications, getUnreadCount } = useApp();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const assignedTemplates = useMemo(() =>
    templates.filter(t => currentUser.assignedTemplates.includes(t.id)),
    [templates, currentUser.assignedTemplates]
  );

  const reportStatuses = useMemo(() => {
    return assignedTemplates.map(tpl => {
      const sub = submissions.find(s =>
        s.userId === currentUser.id &&
        s.templateId === tpl.id &&
        s.month === CURRENT_MONTH &&
        s.year === CURRENT_YEAR
      );
      return { template: tpl, submission: sub, status: sub?.status ?? 'not_started' };
    });
  }, [assignedTemplates, submissions, currentUser.id]);

  const stats = useMemo(() => ({
    total: reportStatuses.length,
    submitted: reportStatuses.filter(r => r.status === 'submitted').length,
    pending: reportStatuses.filter(r => r.status === 'pending').length,
    late: reportStatuses.filter(r => r.status === 'late').length,
    notStarted: reportStatuses.filter(r => r.status === 'not_started').length,
  }), [reportStatuses]);

  const userNotifs = useMemo(() =>
    notifications.filter(n => n.userId === currentUser.id && !n.read).slice(0, 3),
    [notifications, currentUser.id]
  );

  const unreadCount = getUnreadCount(currentUser.id);

  return (
    <div className="p-6 max-w-screen-lg mx-auto space-y-6">
      {/* Welcome card */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-blue-200 text-sm">Welcome back,</p>
            <h2 className="text-white mt-0.5">{currentUser.name}</h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="px-2.5 py-1 rounded-full bg-white/20 text-white text-xs">{currentUser.office}</span>
              <span className="text-blue-200 text-xs">Employee #{currentUser.number}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-blue-200 text-xs">Current Period</p>
            <p className="text-white text-sm mt-0.5">{MONTHS[CURRENT_MONTH - 1]} {CURRENT_YEAR}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-5">
          <div className="flex justify-between mb-1.5">
            <span className="text-blue-200 text-xs">Submission Progress</span>
            <span className="text-white text-xs">{stats.submitted}/{stats.total} submitted</span>
          </div>
          <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: stats.total > 0 ? `${(stats.submitted / stats.total) * 100}%` : '0%' }}
            />
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Reports', value: stats.total, cls: 'bg-white border-gray-100', textCls: 'text-gray-700' },
          { label: 'Submitted', value: stats.submitted, cls: 'bg-green-50 border-green-100', textCls: 'text-green-600' },
          { label: 'Pending', value: stats.pending, cls: 'bg-amber-50 border-amber-100', textCls: 'text-amber-600' },
          { label: 'Overdue', value: stats.late, cls: 'bg-red-50 border-red-100', textCls: 'text-red-600' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border px-4 py-4 text-center ${s.cls}`}>
            <div className={`text-2xl ${s.textCls}`}>{s.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Reports list */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-800">My Reports — {MONTHS[CURRENT_MONTH - 1]} {CURRENT_YEAR}</h3>
            <button
              onClick={() => navigate('/user/reports')}
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {reportStatuses.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-100 py-12 text-center">
              <FileText className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No reports assigned to you yet.</p>
              <p className="text-gray-400 text-sm mt-1">Contact your administrator.</p>
            </div>
          )}

          {reportStatuses.map(({ template, submission, status }) => {
            const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.not_started;
            return (
              <div
                key={template.id}
                className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow cursor-pointer group"
                onClick={() => navigate(`/user/reports/${template.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 text-xs">{template.shortCode}</span>
                        <h4 className="text-gray-800 text-sm">{template.title}</h4>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <p className="text-gray-400 text-xs">{template.deadline}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${cfg.cls}`}>
                      {cfg.icon}
                      {cfg.label}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </div>
                </div>
                {submission?.submissionDate && (
                  <div className="mt-2 ml-12 text-xs text-gray-400">
                    Submitted: {new Date(submission.submissionDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                )}
                {status === 'submitted' && (
                  <div className="mt-2 ml-12 h-1 rounded-full bg-green-100 overflow-hidden">
                    <div className="h-full w-full bg-green-400 rounded-full" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Notifications sidebar */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-800">Reminders</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-xs">{unreadCount} new</span>
            )}
          </div>

          {userNotifs.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 py-8 text-center">
              <Bell className="w-7 h-7 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No new reminders</p>
            </div>
          ) : (
            <div className="space-y-2">
              {userNotifs.map(n => {
                const typeConfig = {
                  deadline: { cls: 'bg-amber-50 border-amber-100', icon: '⏰' },
                  missing: { cls: 'bg-orange-50 border-orange-100', icon: '📋' },
                  submitted: { cls: 'bg-green-50 border-green-100', icon: '✅' },
                  late: { cls: 'bg-red-50 border-red-100', icon: '⚠️' },
                };
                const nc = typeConfig[n.type];
                return (
                  <div key={n.id} className={`p-3 rounded-xl border ${nc.cls}`}>
                    <div className="flex items-start gap-2">
                      <span className="text-sm">{nc.icon}</span>
                      <p className="text-xs text-gray-700 leading-relaxed">{n.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick guide */}
          <div className="mt-4 bg-blue-50 rounded-xl border border-blue-100 p-4">
            <h4 className="text-blue-800 text-sm mb-2">How to Submit</h4>
            <ol className="space-y-1.5 text-xs text-blue-700">
              <li className="flex items-start gap-2"><span className="w-4 h-4 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center shrink-0 mt-0.5 text-xs">1</span>Click on a report to open</li>
              <li className="flex items-start gap-2"><span className="w-4 h-4 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center shrink-0 mt-0.5 text-xs">2</span>Fill in all required fields</li>
              <li className="flex items-start gap-2"><span className="w-4 h-4 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center shrink-0 mt-0.5 text-xs">3</span>Attach supporting documents</li>
              <li className="flex items-start gap-2"><span className="w-4 h-4 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center shrink-0 mt-0.5 text-xs">4</span>Click Submit Report</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

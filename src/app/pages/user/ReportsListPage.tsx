import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../../context/AppContext';
import { MONTHS } from '../../data/mockData';
import { FileText, CheckCircle, Clock, AlertTriangle, Minus, Calendar, ChevronRight } from 'lucide-react';

const CURRENT_MONTH = 4;
const CURRENT_YEAR = 2026;
const ALL_MONTHS = [1, 2, 3, 4];

const STATUS_CONFIG = {
  submitted: { label: 'Submitted', cls: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500' },
  pending: { label: 'Pending', cls: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  not_started: { label: 'Not Started', cls: 'bg-gray-100 text-gray-500 border-gray-200', dot: 'bg-gray-300' },
  late: { label: 'Overdue', cls: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500' },
};

export default function ReportsListPage() {
  const { currentUser, templates, submissions } = useApp();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const assignedTemplates = useMemo(() =>
    templates.filter(t => currentUser.assignedTemplates.includes(t.id)),
    [templates, currentUser.assignedTemplates]
  );

  const matrix = useMemo(() => {
    return assignedTemplates.map(tpl => {
      const monthStatuses = ALL_MONTHS.map(m => {
        const sub = submissions.find(s =>
          s.userId === currentUser.id &&
          s.templateId === tpl.id &&
          s.month === m &&
          s.year === CURRENT_YEAR
        );
        return { month: m, status: sub?.status ?? 'not_started', submissionDate: sub?.submissionDate };
      });
      return { template: tpl, months: monthStatuses };
    });
  }, [assignedTemplates, submissions, currentUser.id]);

  return (
    <div className="p-6 max-w-screen-lg mx-auto space-y-5">
      <div>
        <h2 className="text-gray-800">My Reports</h2>
        <p className="text-gray-400 text-sm mt-0.5">
          {assignedTemplates.length} report types assigned · {CURRENT_YEAR}
        </p>
      </div>

      {assignedTemplates.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 py-16 text-center">
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No reports assigned to you yet.</p>
          <p className="text-gray-400 text-sm mt-1">Contact your administrator to assign report templates.</p>
        </div>
      )}

      {/* Report cards */}
      <div className="space-y-4">
        {matrix.map(({ template, months }) => (
          <div key={template.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between px-5 py-4 border-b border-gray-50">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
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
              <button
                onClick={() => navigate(`/user/reports/${template.id}`)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
              >
                Submit / View <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Monthly status grid */}
            <div className="px-5 py-3 overflow-x-auto">
              <div className="flex gap-2 min-w-max">
                {months.map(({ month, status, submissionDate }) => {
                  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.not_started;
                  const isCurrentMonth = month === CURRENT_MONTH;
                  return (
                    <button
                      key={month}
                      onClick={() => navigate(`/user/reports/${template.id}?month=${month}`)}
                      className={`flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl border transition-all hover:shadow-sm ${
                        isCurrentMonth
                          ? 'border-blue-300 ring-1 ring-blue-200'
                          : 'border-gray-100'
                      } ${cfg.cls} min-w-16`}
                    >
                      <span className="text-xs font-medium">{MONTHS[month - 1]}</span>
                      <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                      <span className="text-xs leading-none">{cfg.label}</span>
                      {submissionDate && (
                        <span className="text-xs opacity-60">
                          {new Date(submissionDate).getDate()}/{new Date(submissionDate).getMonth() + 1}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { MONTHS, OFFICES, OFFICE_CODES } from '../../data/mockData';
import {
  Filter, Download, CheckCircle, XCircle, Clock,
  Minus, ChevronDown, Table2, LayoutGrid
} from 'lucide-react';

type ViewMode = 'table' | 'matrix';

const STATUS_CONFIG = {
  submitted: { label: 'Submitted', cls: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500', cell: 'bg-green-100 text-green-800' },
  pending: { label: 'Pending', cls: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500', cell: 'bg-amber-100 text-amber-800' },
  not_started: { label: 'Not Started', cls: 'bg-gray-100 text-gray-500 border-gray-200', dot: 'bg-gray-300', cell: 'bg-gray-50 text-gray-400' },
  late: { label: 'Late', cls: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500', cell: 'bg-red-100 text-red-700' },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.not_started;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs border ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export default function SubmissionsPage() {
  const { submissions, users, templates } = useApp();

  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [filterTemplate, setFilterTemplate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterOffice, setFilterOffice] = useState('');
  const [filterMonth, setFilterMonth] = useState('');

  const userMap = useMemo(() => users.reduce((a, u) => ({ ...a, [u.id]: u }), {} as Record<string, typeof users[0]>), [users]);
  const tplMap = useMemo(() => templates.reduce((a, t) => ({ ...a, [t.id]: t }), {} as Record<string, typeof templates[0]>), [templates]);

  const enriched = useMemo(() => submissions.map(s => ({
    ...s,
    userName: userMap[s.userId]?.name ?? '—',
    office: userMap[s.userId]?.office ?? '—',
    templateTitle: tplMap[s.templateId]?.title ?? s.templateId,
    templateShort: tplMap[s.templateId]?.shortCode ?? s.templateId,
  })), [submissions, userMap, tplMap]);

  const filtered = useMemo(() => enriched.filter(s => {
    if (filterTemplate && s.templateId !== filterTemplate) return false;
    if (filterStatus && s.status !== filterStatus) return false;
    if (filterOffice && s.office !== filterOffice) return false;
    if (filterMonth && s.month !== parseInt(filterMonth)) return false;
    return true;
  }), [enriched, filterTemplate, filterStatus, filterOffice, filterMonth]);

  // Matrix view: templates as rows, months as columns, cells show office statuses
  const matrixData = useMemo(() => {
    return templates.map(tpl => {
      const months = MONTHS.map((m, mi) => {
        const monthSubs = submissions.filter(s => s.templateId === tpl.id && s.month === mi + 1);
        const officeStatus: Record<string, string> = {};
        OFFICE_CODES.forEach(office => {
          const user = users.find(u => u.office === office && u.role === 'user');
          if (user) {
            const sub = monthSubs.find(s => s.userId === user.id);
            officeStatus[office] = sub?.status ?? 'not_started';
          }
        });
        return { month: m, ...officeStatus };
      });
      return { template: tpl, months };
    });
  }, [templates, submissions, users]);

  const stats = useMemo(() => ({
    total: filtered.length,
    submitted: filtered.filter(s => s.status === 'submitted').length,
    pending: filtered.filter(s => s.status === 'pending').length,
    late: filtered.filter(s => s.status === 'late').length,
  }), [filtered]);

  return (
    <div className="p-6 max-w-screen-xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-gray-800">Submissions Monitor</h2>
          <p className="text-gray-400 text-sm mt-0.5">Division: FAD — PO to RO submissions tracking</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              <Table2 className="w-3.5 h-3.5" />
              Table
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${viewMode === 'matrix' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Matrix
            </button>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'text-gray-700' },
          { label: 'Submitted', value: stats.submitted, color: 'text-green-600' },
          { label: 'Pending', value: stats.pending, color: 'text-amber-600' },
          { label: 'Late', value: stats.late, color: 'text-red-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 px-4 py-3 text-center">
            <div className={`text-xl ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 px-5 py-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-500">Filter:</span>

          <select
            value={filterTemplate}
            onChange={e => setFilterTemplate(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Reports</option>
            {templates.map(t => <option key={t.id} value={t.id}>{t.shortCode} — {t.title}</option>)}
          </select>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>

          <select
            value={filterOffice}
            onChange={e => setFilterOffice(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Offices</option>
            {OFFICES.map(o => <option key={o.code} value={o.code}>{o.name}</option>)}
          </select>

          <select
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Months</option>
            {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>

          {(filterTemplate || filterStatus || filterOffice || filterMonth) && (
            <button
              onClick={() => { setFilterTemplate(''); setFilterStatus(''); setFilterOffice(''); setFilterMonth(''); }}
              className="px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Table view */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-5 py-3 text-xs text-gray-500 font-medium">User</th>
                  <th className="px-5 py-3 text-xs text-gray-500 font-medium">Office</th>
                  <th className="px-5 py-3 text-xs text-gray-500 font-medium">Report</th>
                  <th className="px-5 py-3 text-xs text-gray-500 font-medium">Period</th>
                  <th className="px-5 py-3 text-xs text-gray-500 font-medium">Status</th>
                  <th className="px-5 py-3 text-xs text-gray-500 font-medium">Submitted On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-400 text-sm">
                      No submissions match the selected filters
                    </td>
                  </tr>
                )}
                {filtered.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3 text-gray-800">{s.userName}</td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs">{s.office}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="text-gray-800">{s.templateShort}</div>
                      <div className="text-gray-400 text-xs">{s.templateTitle}</div>
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{MONTHS[s.month - 1]} {s.year}</td>
                    <td className="px-5 py-3"><StatusBadge status={s.status} /></td>
                    <td className="px-5 py-3 text-gray-400 text-xs">
                      {s.submissionDate
                        ? new Date(s.submissionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Matrix view (like reference image) */}
      {viewMode === 'matrix' && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-50 flex items-center justify-between">
            <h4 className="text-sm text-gray-700">DATE OF SUBMISSIONS (PO to RO) — Division: FAD</h4>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <span key={k} className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${v.dot}`} />
                  {v.label}
                </span>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-3 py-2 text-left text-gray-600 font-medium border border-gray-100 min-w-36 sticky left-0 bg-gray-50 z-10">REPORT</th>
                  <th className="px-2 py-2 text-gray-500 font-medium border border-gray-100 min-w-28">DEADLINE</th>
                  {MONTHS.map(m => (
                    <th key={m} className="px-2 py-2 text-center text-gray-500 font-medium border border-gray-100 min-w-20">{m}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrixData.map(({ template, months }) => (
                  <tr key={template.id} className="hover:bg-gray-50/50">
                    <td className="px-3 py-2.5 border border-gray-100 sticky left-0 bg-white z-10">
                      <div className="text-gray-800 font-medium">{template.shortCode}</div>
                      <div className="text-gray-400 leading-tight">{template.title}</div>
                    </td>
                    <td className="px-2 py-2.5 border border-gray-100 text-gray-500 max-w-28 align-top">
                      <span className="block leading-tight">{template.deadline}</span>
                    </td>
                    {months.map(({ month, ...officeStatuses }) => (
                      <td key={month} className="px-2 py-2 border border-gray-100 align-top">
                        <div className="space-y-0.5">
                          {OFFICES.map(office => {
                            const status = officeStatuses[office.code] as string ?? 'not_started';
                            const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.not_started;
                            return (
                              <div
                                key={office.code}
                                className={`px-1 py-0.5 rounded text-center ${cfg.cell}`}
                                title={`${office.name}: ${cfg.label}`}
                              >
                                {office.name}
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../../context/AppContext';
import { MONTHS } from '../../data/mockData';
import {
  Users, FileText, ClipboardCheck, Clock, AlertTriangle,
  TrendingUp, ChevronRight, CheckCircle, XCircle
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const STATUS_COLORS: Record<string, string> = {
  submitted: '#22c55e',
  pending: '#f59e0b',
  not_started: '#94a3b8',
  late: '#ef4444',
};

const STATUS_LABELS: Record<string, string> = {
  submitted: 'Submitted',
  pending: 'Pending',
  not_started: 'Not Started',
  late: 'Late',
};

function StatCard({ icon: Icon, label, value, color, sub }: {
  icon: React.ElementType; label: string; value: number | string;
  color: string; sub?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-2xl text-gray-800">{value}</div>
        <div className="text-sm text-gray-500">{label}</div>
        {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { users, templates, submissions } = useApp();
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const totalUsers = users.filter(u => u.role === 'user').length;
    const totalTemplates = templates.length;
    const totalSubs = submissions.length;
    const submitted = submissions.filter(s => s.status === 'submitted').length;
    const pending = submissions.filter(s => s.status === 'pending').length;
    const late = submissions.filter(s => s.status === 'late').length;
    const notStarted = submissions.filter(s => s.status === 'not_started').length;
    return { totalUsers, totalTemplates, totalSubs, submitted, pending, late, notStarted };
  }, [users, templates, submissions]);

  // Monthly submission counts for bar chart
  const monthlyData = useMemo(() => {
    return MONTHS.map((m, i) => {
      const count = submissions.filter(s => s.month === i + 1).length;
      const done = submissions.filter(s => s.month === i + 1 && s.status === 'submitted').length;
      return { month: m, Total: count, Submitted: done };
    });
  }, [submissions]);

  // Status pie data
  const pieData = useMemo(() => [
    { name: 'Submitted', value: stats.submitted, color: STATUS_COLORS.submitted },
    { name: 'Pending', value: stats.pending, color: STATUS_COLORS.pending },
    { name: 'Not Started', value: stats.notStarted, color: STATUS_COLORS.not_started },
    { name: 'Late', value: stats.late, color: STATUS_COLORS.late },
  ].filter(d => d.value > 0), [stats]);

  // Recent submissions
  const recentSubs = useMemo(() => {
    const nonUsers = users.reduce((acc, u) => ({ ...acc, [u.id]: u }), {} as Record<string, typeof users[0]>);
    const tplMap = templates.reduce((acc, t) => ({ ...acc, [t.id]: t }), {} as Record<string, typeof templates[0]>);
    return [...submissions]
      .sort((a, b) => {
        const da = a.submissionDate ? new Date(a.submissionDate).getTime() : 0;
        const db = b.submissionDate ? new Date(b.submissionDate).getTime() : 0;
        return db - da;
      })
      .slice(0, 8)
      .map(s => ({
        ...s,
        userName: nonUsers[s.userId]?.name ?? '—',
        office: nonUsers[s.userId]?.office ?? '—',
        templateTitle: tplMap[s.templateId]?.shortCode ?? s.templateId,
      }));
  }, [submissions, users, templates]);

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      submitted: 'bg-green-100 text-green-700 border-green-200',
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
      not_started: 'bg-gray-100 text-gray-600 border-gray-200',
      late: 'bg-red-100 text-red-700 border-red-200',
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${map[status] || map.not_started}`}>
        {status === 'submitted' && <CheckCircle className="w-3 h-3" />}
        {status === 'late' && <XCircle className="w-3 h-3" />}
        {status === 'pending' && <Clock className="w-3 h-3" />}
        {STATUS_LABELS[status] ?? status}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Users" value={stats.totalUsers} color="bg-blue-50 text-blue-600" sub="Staff accounts" />
        <StatCard icon={FileText} label="Report Templates" value={stats.totalTemplates} color="bg-indigo-50 text-indigo-600" sub="Active templates" />
        <StatCard icon={ClipboardCheck} label="Submitted" value={stats.submitted} color="bg-green-50 text-green-600" sub={`${Math.round((stats.submitted / (stats.totalSubs || 1)) * 100)}% of total`} />
        <StatCard icon={AlertTriangle} label="Late / Overdue" value={stats.late} color="bg-red-50 text-red-600" sub={`${stats.pending} pending`} />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Bar chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-gray-800">Monthly Submissions</h3>
              <p className="text-gray-400 text-xs mt-0.5">Total vs submitted reports per month</p>
            </div>
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} barSize={10} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="Total" fill="#e0e7ff" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Submitted" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2">
            <span className="flex items-center gap-1.5 text-xs text-gray-400"><span className="w-3 h-3 rounded bg-indigo-500 inline-block" />Submitted</span>
            <span className="flex items-center gap-1.5 text-xs text-gray-400"><span className="w-3 h-3 rounded bg-indigo-100 inline-block" />Total</span>
          </div>
        </div>

        {/* Pie chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-gray-800 mb-1">Status Overview</h3>
          <p className="text-gray-400 text-xs mb-3">All submissions breakdown</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value">
                {pieData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: d.color }} />
                  <span className="text-xs text-gray-500">{d.name}</span>
                </div>
                <span className="text-xs text-gray-700">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent submissions table */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <h3 className="text-gray-800">Recent Submissions</h3>
          <button
            onClick={() => navigate('/admin/submissions')}
            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
          >
            View all <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-5 py-3 text-xs text-gray-500 font-medium">User</th>
                <th className="px-5 py-3 text-xs text-gray-500 font-medium">Office</th>
                <th className="px-5 py-3 text-xs text-gray-500 font-medium">Report</th>
                <th className="px-5 py-3 text-xs text-gray-500 font-medium">Period</th>
                <th className="px-5 py-3 text-xs text-gray-500 font-medium">Status</th>
                <th className="px-5 py-3 text-xs text-gray-500 font-medium">Date Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentSubs.map(s => (
                <tr key={s.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3 text-gray-800">{s.userName}</td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs">{s.office}</span>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{s.templateTitle}</td>
                  <td className="px-5 py-3 text-gray-500 text-xs">
                    {MONTHS[(s.month - 1)]} {s.year}
                  </td>
                  <td className="px-5 py-3">{statusBadge(s.status)}</td>
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
    </div>
  );
}

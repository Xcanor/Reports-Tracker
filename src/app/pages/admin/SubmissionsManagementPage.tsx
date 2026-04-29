import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Eye, Trash2, Edit, AlertCircle, CheckCircle } from 'lucide-react';

export default function SubmissionsManagementPage() {
  const { submissions, users, templates, updateSubmission, deleteSubmission } = useApp();
  
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const userMap = useMemo(() => users.reduce((a, u) => ({ ...a, [u.id]: u }), {} as Record<string, typeof users[0]>), [users]);
  const tplMap = useMemo(() => templates.reduce((a, t) => ({ ...a, [t.id]: t }), {} as Record<string, typeof templates[0]>), [templates]);

  const enriched = useMemo(() => submissions.map(s => ({
    ...s,
    userName: userMap[s.userId]?.name ?? '—',
    userEmail: userMap[s.userId]?.email ?? '—',
    templateTitle: tplMap[s.templateId]?.title ?? s.templateId,
    templateShort: tplMap[s.templateId]?.shortCode ?? s.templateId,
  })), [submissions, userMap, tplMap]);

  const filtered = useMemo(() => enriched.filter(s => {
    if (filterStatus && s.status !== filterStatus) return false;
    if (searchTerm && 
        !s.userName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !s.templateTitle.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  }), [enriched, filterStatus, searchTerm]);

  const handleDelete = (id: string) => {
    deleteSubmission(id);
    setShowDeleteConfirm(null);
    setSuccess('Submission deleted successfully');
    setTimeout(() => setSuccess(''), 3000);
  };

  const currentSubmission = selectedSubmission ? enriched.find(s => s.id === selectedSubmission) : null;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Submissions Management</h1>
        <p className="text-gray-600 mt-1">View, edit, and delete submissions</p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
          <p className="text-red-800">{error}</p>
        </div>
      )}
      {success && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <input
          type="text"
          placeholder="Search by name or template..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Statuses</option>
          <option value="submitted">Submitted</option>
          <option value="pending">Pending</option>
          <option value="late">Late</option>
          <option value="not_started">Not Started</option>
        </select>
      </div>

      {/* Submissions Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">User</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Template</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Submission Date</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(submission => (
              <tr key={submission.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{submission.userName}</p>
                    <p className="text-sm text-gray-500">{submission.userEmail}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900">{submission.templateShort}</p>
                  <p className="text-sm text-gray-500">{submission.templateTitle}</p>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {submission.submissionDate || '—'}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    submission.status === 'submitted'
                      ? 'bg-green-100 text-green-800'
                      : submission.status === 'late'
                      ? 'bg-red-100 text-red-800'
                      : submission.status === 'pending'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {submission.status === 'submitted' ? 'Submitted' :
                     submission.status === 'late' ? 'Late' :
                     submission.status === 'pending' ? 'Pending' : 'Not Started'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedSubmission(submission.id)}
                      className="p-1.5 hover:bg-blue-100 rounded transition-colors text-blue-600"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(submission.id)}
                      className="p-1.5 hover:bg-red-100 rounded transition-colors text-red-600"
                      title="Delete submission"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Details Modal */}
      {currentSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{currentSubmission.templateShort}</h2>
                <p className="text-sm text-gray-600">{currentSubmission.userName}</p>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Submitted By</p>
                  <p className="text-gray-900">{currentSubmission.userName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Email</p>
                  <p className="text-gray-900">{currentSubmission.userEmail}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Submission Date</p>
                  <p className="text-gray-900">{currentSubmission.submissionDate || '—'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    currentSubmission.status === 'submitted'
                      ? 'bg-green-100 text-green-800'
                      : currentSubmission.status === 'late'
                      ? 'bg-red-100 text-red-800'
                      : currentSubmission.status === 'pending'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {currentSubmission.status === 'submitted' ? 'Submitted' :
                     currentSubmission.status === 'late' ? 'Late' :
                     currentSubmission.status === 'pending' ? 'Pending' : 'Not Started'}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Submission Data</h3>
                <div className="space-y-3">
                  {Object.entries(currentSubmission.data || {}).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs font-medium text-gray-600 mb-1">{key}</p>
                      <p className="text-gray-900 break-words">{value || '—'}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 flex gap-3">
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm mx-4">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Delete Submission?</h2>
            <p className="text-gray-600 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors font-medium"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../../context/AppContext';
import { Plus, Pencil, Trash2, FileText, Calendar, AlertCircle, Search } from 'lucide-react';

const TYPE_ICONS: Record<string, string> = {
  text: '📝',
  file: '📎',
  date: '📅',
  dropdown: '🔽',
  number: '🔢',
};

export default function Templates() {
  const { templates, deleteTemplate } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = templates.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.shortCode.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string) => {
    deleteTemplate(id);
    setDeleteConfirm(null);
  };

  return (
    <div className="p-6 max-w-screen-xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-gray-800">Report Templates</h2>
          <p className="text-gray-400 text-sm mt-0.5">{templates.length} templates defined</p>
        </div>
        <button
          onClick={() => navigate('/admin/templates/new')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Template
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search templates..."
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 py-16 flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
            <FileText className="w-7 h-7 text-gray-400" />
          </div>
          <div className="text-center">
            <p className="text-gray-600">No templates found</p>
            <p className="text-gray-400 text-sm mt-1">Create your first report template to get started</p>
          </div>
          <button
            onClick={() => navigate('/admin/templates/new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
          >
            <Plus className="w-4 h-4" />
            Create Template
          </button>
        </div>
      )}

      {/* Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(template => (
          <div
            key={template.id}
            className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow group relative"
          >
            {/* Title */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-gray-800 text-sm leading-snug">{template.title}</h4>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-xs">
                    {template.shortCode}
                  </span>
                </div>
              </div>
            </div>

            {/* Deadline */}
            <div className="flex items-start gap-2 mb-3">
              <Calendar className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
              <p className="text-xs text-gray-500 leading-relaxed">{template.deadline}</p>
            </div>

            {/* Fields */}
            <div className="mb-4">
              <p className="text-xs text-gray-400 mb-2">{template.fields.length} fields defined</p>
              <div className="flex flex-wrap gap-1">
                {template.fields.map(f => (
                  <span key={f.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-50 border border-gray-100 text-xs text-gray-500">
                    <span>{TYPE_ICONS[f.type]}</span>
                    {f.label}
                    {f.required && <span className="text-red-400">*</span>}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-3 border-t border-gray-50">
              <button
                onClick={() => navigate(`/admin/templates/${template.id}`)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs hover:bg-gray-50 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </button>
              {deleteConfirm === template.id ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs hover:bg-red-600 transition-colors"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 text-xs hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDeleteConfirm(template.id)}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-red-500 text-xs hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <p className="text-xs text-gray-300 mt-2">Created {template.createdAt}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

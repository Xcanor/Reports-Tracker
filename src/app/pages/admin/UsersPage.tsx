import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { OFFICES, OFFICE_CODES } from '../../data/mockData';
import type { AppUser, UserRole } from '../../types';
import {
  Plus, Pencil, Trash2, Search, X, Save, Users,
  Shield, User, CheckCircle, FileText, AlertCircle, Key
} from 'lucide-react';

const EMPTY_FORM = { name: '', office: '', number: '', role: 'user' as UserRole, assignedTemplates: [] as string[] };

function UserModal({
  user, templates, onSave, onClose
}: {
  user?: AppUser | null;
  templates: { id: string; title: string; shortCode: string }[];
  onSave: (data: typeof EMPTY_FORM) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<typeof EMPTY_FORM>(
    user ? { name: user.name, office: user.office, number: user.number, role: user.role, assignedTemplates: user.assignedTemplates } : EMPTY_FORM
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.office) errs.office = 'Office is required';
    if (!form.number.trim()) errs.number = 'Employee number is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave(form);
  };

  const toggleTemplate = (id: string) => {
    setForm(f => ({
      ...f,
      assignedTemplates: f.assignedTemplates.includes(id)
        ? f.assignedTemplates.filter(t => t !== id)
        : [...f.assignedTemplates, id],
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-gray-800">{user ? 'Edit User' : 'Add New User'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Full Name <span className="text-red-400">*</span></label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-300' : 'border-gray-200'}`}
                placeholder="Full name"
              />
              {errors.name && <p className="text-red-500 text-xs mt-0.5">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Employee Number <span className="text-red-400">*</span></label>
              <input
                value={form.number}
                onChange={e => setForm(f => ({ ...f, number: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.number ? 'border-red-300' : 'border-gray-200'}`}
                placeholder="e.g. 007"
              />
              {errors.number && <p className="text-red-500 text-xs mt-0.5">{errors.number}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Office <span className="text-red-400">*</span></label>
              <select
                value={form.office}
                onChange={e => setForm(f => ({ ...f, office: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${errors.office ? 'border-red-300' : 'border-gray-200'}`}
              >
                <option value="">Select office...</option>
                <option value="RO-HQ">RO-HQ</option>
                {OFFICES.map(o => <option key={o.code} value={o.code}>{o.name}</option>)}
              </select>
              {errors.office && <p className="text-red-500 text-xs mt-0.5">{errors.office}</p>}
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Role</label>
              <div className="flex gap-2 mt-1">
                {(['admin', 'user'] as UserRole[]).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, role: r }))}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-colors ${
                      form.role === r ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {r === 'admin' ? <Shield className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                    {r === 'admin' ? 'Admin' : 'User'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Assigned templates */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">Assigned Report Templates</label>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {templates.map(t => (
                <label key={t.id} className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.assignedTemplates.includes(t.id)}
                    onChange={() => toggleTemplate(t.id)}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <span className="inline-flex items-center gap-1.5 text-sm text-gray-700">
                    <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 text-xs">{t.shortCode}</span>
                    {t.title}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            {user ? 'Save Changes' : 'Add User'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const { users, templates, addUser, updateUser, deleteUser } = useApp();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [passwordModal, setPasswordModal] = useState<AppUser | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const staffUsers = useMemo(() => users.filter(u => u.role !== 'admin' || u.id === 'admin-1'), [users]);

  const filtered = useMemo(() =>
    users.filter(u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.office.toLowerCase().includes(search.toLowerCase()) ||
      u.number.includes(search)
    ), [users, search]);

  const handleSave = (data: typeof EMPTY_FORM) => {
    if (modal === 'edit' && editingUser) {
      updateUser(editingUser.id, data);
    } else {
      addUser(data);
    }
    setModal(null);
    setEditingUser(null);
  };

  const handleEdit = (user: AppUser) => {
    setEditingUser(user);
    setModal('edit');
  };

  const handleDelete = (id: string) => {
    deleteUser(id);
    setDeleteConfirm(null);
  };

  const handlePasswordChange = (userId: string) => {
    if (!newPassword.trim()) return;

    updateUser(userId, { password: newPassword.trim() });
    setPasswordModal(null);
    setNewPassword('');
  };

  return (
    <div className="p-6 max-w-screen-xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-gray-800">User Management</h2>
          <p className="text-gray-400 text-sm mt-0.5">
            {users.filter(u => u.role === 'user').length} staff accounts · {users.filter(u => u.role === 'admin').length} admin
          </p>
        </div>
        <button
          onClick={() => setModal('add')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, office, or number..."
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-5 py-3 text-xs text-gray-500 font-medium">Name</th>
                <th className="px-5 py-3 text-xs text-gray-500 font-medium">Office</th>
                <th className="px-5 py-3 text-xs text-gray-500 font-medium">Emp. No.</th>
                <th className="px-5 py-3 text-xs text-gray-500 font-medium">Role</th>
                <th className="px-5 py-3 text-xs text-gray-500 font-medium">Assigned Reports</th>
                <th className="px-5 py-3 text-xs text-gray-500 font-medium">Joined</th>
                <th className="px-5 py-3 text-xs text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400 text-sm">
                    No users found
                  </td>
                </tr>
              )}
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <span className="text-gray-800">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs">{u.office}</span>
                  </td>
                  <td className="px-5 py-3 text-gray-500 font-mono text-xs">{u.number}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs border ${
                      u.role === 'admin'
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : 'bg-green-50 text-green-700 border-green-200'
                    }`}>
                      {u.role === 'admin' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                      {u.role === 'admin' ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {u.assignedTemplates.length === 0 ? (
                      <span className="text-gray-300 text-xs">None assigned</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {u.assignedTemplates.slice(0, 3).map(tId => {
                          const tpl = templates.find(t => t.id === tId);
                          return tpl ? (
                            <span key={tId} className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 text-xs">{tpl.shortCode}</span>
                          ) : null;
                        })}
                        {u.assignedTemplates.length > 3 && (
                          <span className="text-gray-400 text-xs">+{u.assignedTemplates.length - 3}</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{u.createdAt}</td>
                  <td className="px-5 py-3">
                    {deleteConfirm === u.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleDelete(u.id)} className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600">Confirm</button>
                        <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 border border-gray-200 text-gray-500 rounded text-xs">Cancel</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(u)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        {u.id !== 'admin-1' && (
                          <button
                            onClick={() => setDeleteConfirm(u.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <UserModal
          user={modal === 'edit' ? editingUser : null}
          templates={templates}
          onSave={handleSave}
          onClose={() => { setModal(null); setEditingUser(null); }}
        />
      )}

      {/* Password Change Modal */}
      {passwordModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg text-gray-800 flex items-center gap-2">
                <Key className="w-5 h-5" />
                Change Password
              </h3>
              <button
                onClick={() => {
                  setPasswordModal(null);
                  setNewPassword('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-3">
                  <Key className="w-6 h-6 text-orange-600" />
                </div>
                <h4 className="text-gray-800 font-medium">{passwordModal.name}</h4>
                <p className="text-gray-500 text-sm">{passwordModal.office} • {passwordModal.role}</p>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setPasswordModal(null);
                    setNewPassword('');
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handlePasswordChange(passwordModal.id)}
                  disabled={!newPassword.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700 disabled:bg-orange-400 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Update Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

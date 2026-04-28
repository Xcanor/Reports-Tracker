import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useApp } from '../../context/AppContext';
import type { TemplateField, FieldType } from '../../types';
import {
  Plus, Trash2, ArrowUp, ArrowDown, GripVertical, Save,
  ArrowLeft, Type, Calendar, Upload, ChevronDown, Hash,
  ToggleLeft, ToggleRight, AlertCircle, CheckCircle2, Eye
} from 'lucide-react';

const FIELD_TYPES: { value: FieldType; label: string; icon: React.ReactNode; description: string }[] = [
  { value: 'text', label: 'Text Input', icon: <Type className="w-4 h-4" />, description: 'Free-form text entry' },
  { value: 'number', label: 'Number', icon: <Hash className="w-4 h-4" />, description: 'Numeric values' },
  { value: 'date', label: 'Date Picker', icon: <Calendar className="w-4 h-4" />, description: 'Date selection' },
  { value: 'file', label: 'File Upload', icon: <Upload className="w-4 h-4" />, description: 'Attach documents' },
  { value: 'dropdown', label: 'Dropdown', icon: <ChevronDown className="w-4 h-4" />, description: 'Select from list' },
];

function FieldRow({
  field, index, total,
  onChange, onDelete, onMoveUp, onMoveDown
}: {
  field: TemplateField;
  index: number;
  total: number;
  onChange: (id: string, updates: Partial<TemplateField>) => void;
  onDelete: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
}) {
  const [optionInput, setOptionInput] = useState('');

  const addOption = () => {
    if (!optionInput.trim()) return;
    onChange(field.id, { options: [...(field.options || []), optionInput.trim()] });
    setOptionInput('');
  };

  const removeOption = (opt: string) => {
    onChange(field.id, { options: (field.options || []).filter(o => o !== opt) });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 group hover:border-blue-200 transition-colors">
      <div className="flex items-start gap-3">
        {/* Drag handle & order */}
        <div className="flex flex-col items-center gap-1 mt-1">
          <GripVertical className="w-4 h-4 text-gray-300" />
          <span className="text-xs text-gray-300 w-5 text-center">{index + 1}</span>
        </div>

        {/* Main content */}
        <div className="flex-1 space-y-3">
          {/* Label + Type row */}
          <div className="flex items-center gap-2 flex-wrap">
            <input
              value={field.label}
              onChange={e => onChange(field.id, { label: e.target.value })}
              placeholder="Field label..."
              className="flex-1 min-w-40 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={field.type}
              onChange={e => onChange(field.id, { type: e.target.value as FieldType, options: e.target.value === 'dropdown' ? [] : undefined })}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {FIELD_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            {/* Required toggle */}
            <button
              type="button"
              onClick={() => onChange(field.id, { required: !field.required })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors ${
                field.required
                  ? 'bg-red-50 border-red-200 text-red-600'
                  : 'bg-gray-50 border-gray-200 text-gray-500'
              }`}
            >
              {field.required
                ? <ToggleRight className="w-3.5 h-3.5" />
                : <ToggleLeft className="w-3.5 h-3.5" />}
              {field.required ? 'Required' : 'Optional'}
            </button>
          </div>

          {/* Dropdown options */}
          {field.type === 'dropdown' && (
            <div className="pl-1">
              <p className="text-xs text-gray-500 mb-2">Dropdown options:</p>
              <div className="flex flex-wrap gap-1 mb-2">
                {(field.options || []).map(opt => (
                  <span key={opt} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-xs text-blue-700">
                    {opt}
                    <button type="button" onClick={() => removeOption(opt)} className="hover:text-red-500">×</button>
                  </span>
                ))}
                {(field.options || []).length === 0 && (
                  <span className="text-xs text-gray-400 italic">No options added yet</span>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  value={optionInput}
                  onChange={e => setOptionInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addOption())}
                  placeholder="Add option..."
                  className="flex-1 px-3 py-1 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={addOption}
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => onMoveUp(field.id)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition-colors"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={index === total - 1}
            onClick={() => onMoveDown(field.id)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition-colors"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(field.id)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TemplateEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { templates, addTemplate, updateTemplate } = useApp();

  const isEdit = Boolean(id);
  const existing = isEdit ? templates.find(t => t.id === id) : null;

  const [title, setTitle] = useState(existing?.title ?? '');
  const [shortCode, setShortCode] = useState(existing?.shortCode ?? '');
  const [deadline, setDeadline] = useState(existing?.deadline ?? '');
  const [fields, setFields] = useState<TemplateField[]>(existing?.fields ?? []);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [preview, setPreview] = useState(false);

  const addField = () => {
    const newField: TemplateField = {
      id: `f-${Date.now()}`,
      label: '',
      type: 'text',
      required: false,
      order: fields.length,
    };
    setFields(prev => [...prev, newField]);
  };

  const updateField = (id: string, updates: Partial<TemplateField>) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const deleteField = (id: string) => {
    setFields(prev => prev.filter(f => f.id !== id).map((f, i) => ({ ...f, order: i })));
  };

  const moveField = (id: string, dir: 'up' | 'down') => {
    setFields(prev => {
      const idx = prev.findIndex(f => f.id === id);
      if (dir === 'up' && idx === 0) return prev;
      if (dir === 'down' && idx === prev.length - 1) return prev;
      const arr = [...prev];
      const swap = dir === 'up' ? idx - 1 : idx + 1;
      [arr[idx], arr[swap]] = [arr[swap], arr[idx]];
      return arr.map((f, i) => ({ ...f, order: i }));
    });
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Report title is required';
    if (!shortCode.trim()) errs.shortCode = 'Short code is required';
    if (!deadline.trim()) errs.deadline = 'Deadline description is required';
    if (fields.length === 0) errs.fields = 'Add at least one field';
    fields.forEach((f, i) => {
      if (!f.label.trim()) errs[`field_${i}`] = `Field ${i + 1} needs a label`;
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const payload = { title, shortCode, deadline, fields };
    if (isEdit && id) {
      updateTemplate(id, payload);
    } else {
      addTemplate(payload);
    }
    setSaved(true);
    setTimeout(() => navigate('/admin/templates'), 800);
  };

  const fieldTypeMeta = FIELD_TYPES.reduce((acc, t) => ({ ...acc, [t.value]: t }), {} as Record<string, typeof FIELD_TYPES[0]>);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate('/admin/templates')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Templates
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-gray-800">{isEdit ? 'Edit Template' : 'Create Report Template'}</h2>
          <p className="text-gray-400 text-sm mt-0.5">
            {isEdit ? `Editing: ${existing?.title}` : 'Define the structure of a new report type'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPreview(p => !p)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
            preview ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Eye className="w-4 h-4" />
          {preview ? 'Hide Preview' : 'Preview Form'}
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Editor */}
        <div className="space-y-5">
          {/* Template details */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
            <h3 className="text-gray-700 text-sm border-b border-gray-50 pb-2">Template Details</h3>

            <div>
              <label className="block text-sm text-gray-700 mb-1.5">
                Report Title <span className="text-red-400">*</span>
              </label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Monthly Financial Report"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.title ? 'border-red-300' : 'border-gray-200'}`}
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1.5">
                Short Code <span className="text-red-400">*</span>
              </label>
              <input
                value={shortCode}
                onChange={e => setShortCode(e.target.value.toUpperCase())}
                placeholder="e.g. MFR"
                maxLength={8}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.shortCode ? 'border-red-300' : 'border-gray-200'}`}
              />
              {errors.shortCode && <p className="text-red-500 text-xs mt-1">{errors.shortCode}</p>}
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1.5">
                Deadline / Frequency <span className="text-red-400">*</span>
              </label>
              <input
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                placeholder="e.g. Every 10th day of the month"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.deadline ? 'border-red-300' : 'border-gray-200'}`}
              />
              {errors.deadline && <p className="text-red-500 text-xs mt-1">{errors.deadline}</p>}
            </div>
          </div>

          {/* Fields */}
          <div className="bg-gray-50 rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-gray-700 text-sm">Form Fields</h3>
                <p className="text-gray-400 text-xs mt-0.5">{fields.length} field{fields.length !== 1 ? 's' : ''} added</p>
              </div>
              <button
                type="button"
                onClick={addField}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Field
              </button>
            </div>

            {errors.fields && (
              <div className="flex items-center gap-2 p-3 mb-3 rounded-lg bg-red-50 border border-red-100">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-red-600 text-xs">{errors.fields}</p>
              </div>
            )}

            <div className="space-y-2">
              {fields.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                    <Plus className="w-5 h-5" />
                  </div>
                  <p className="text-sm">No fields yet. Click "Add Field" to start building the form.</p>
                </div>
              )}
              {fields.map((field, idx) => (
                <div key={field.id}>
                  <FieldRow
                    field={field}
                    index={idx}
                    total={fields.length}
                    onChange={updateField}
                    onDelete={deleteField}
                    onMoveUp={(id) => moveField(id, 'up')}
                    onMoveDown={(id) => moveField(id, 'down')}
                  />
                  {errors[`field_${idx}`] && (
                    <p className="text-red-500 text-xs mt-1 pl-10">{errors[`field_${idx}`]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Save button */}
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/admin/templates')}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saved}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-green-500 text-white rounded-lg text-sm transition-colors"
            >
              {saved ? (
                <><CheckCircle2 className="w-4 h-4" /> Saved!</>
              ) : (
                <><Save className="w-4 h-4" /> {isEdit ? 'Save Changes' : 'Create Template'}</>
              )}
            </button>
          </div>
        </div>

        {/* Preview panel */}
        {preview && (
          <div className="bg-white rounded-xl border border-gray-100 p-5 h-fit">
            <div className="mb-4">
              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Form Preview</span>
              <h3 className="text-gray-800 mt-2">{title || 'Untitled Report'}</h3>
              {deadline && <p className="text-gray-400 text-xs mt-1">📅 {deadline}</p>}
            </div>
            <div className="space-y-3">
              {fields.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-4">Add fields to see the preview</p>
              )}
              {fields.map(f => (
                <div key={f.id}>
                  <label className="flex items-center gap-1 text-sm text-gray-700 mb-1">
                    {fieldTypeMeta[f.type]?.icon}
                    {f.label || 'Unnamed Field'}
                    {f.required && <span className="text-red-400">*</span>}
                  </label>
                  {f.type === 'text' && (
                    <input disabled placeholder="Text input..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400" />
                  )}
                  {f.type === 'number' && (
                    <input disabled type="number" placeholder="0.00" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400" />
                  )}
                  {f.type === 'date' && (
                    <input disabled type="date" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400" />
                  )}
                  {f.type === 'file' && (
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-3 text-center text-gray-400 text-xs">
                      📎 Click to upload file
                    </div>
                  )}
                  {f.type === 'dropdown' && (
                    <select disabled className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400">
                      <option>Select option...</option>
                      {(f.options || []).map(o => <option key={o}>{o}</option>)}
                    </select>
                  )}
                </div>
              ))}
              {fields.length > 0 && (
                <button disabled className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm opacity-50 mt-2">
                  Submit Report
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

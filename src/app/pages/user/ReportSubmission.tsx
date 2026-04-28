import { useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router';
import { useApp } from '../../context/AppContext';
import { MONTHS } from '../../data/mockData';
import type { FieldType } from '../../types';
import {
  ArrowLeft, Send, CheckCircle2, AlertCircle, FileText,
  Calendar, Upload, Type, Hash, ChevronDown, Clock,
  AlertTriangle, Minus, RefreshCcw
} from 'lucide-react';

const CURRENT_MONTH = 4;
const CURRENT_YEAR = 2026;

const FIELD_ICONS: Record<FieldType, React.ReactNode> = {
  text: <Type className="w-4 h-4" />,
  number: <Hash className="w-4 h-4" />,
  date: <Calendar className="w-4 h-4" />,
  file: <Upload className="w-4 h-4" />,
  dropdown: <ChevronDown className="w-4 h-4" />,
};

const STATUS_CONFIG = {
  submitted: {
    label: 'Submitted',
    cls: 'bg-green-50 border-green-200 text-green-700',
    icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
    banner: 'bg-green-50 border-green-200',
  },
  pending: {
    label: 'In Progress',
    cls: 'bg-amber-50 border-amber-200 text-amber-700',
    icon: <Clock className="w-5 h-5 text-amber-500" />,
    banner: 'bg-amber-50 border-amber-200',
  },
  not_started: {
    label: 'Not Started',
    cls: 'bg-gray-50 border-gray-200 text-gray-500',
    icon: <Minus className="w-5 h-5 text-gray-400" />,
    banner: 'bg-gray-50 border-gray-100',
  },
  late: {
    label: 'Overdue',
    cls: 'bg-red-50 border-red-200 text-red-600',
    icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
    banner: 'bg-red-50 border-red-200',
  },
};

export default function ReportSubmission() {
  const { templateId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser, templates, getSubmissionForUser, addSubmission } = useApp();

  const queryMonth = parseInt(searchParams.get('month') || '') || CURRENT_MONTH;
  const [selectedMonth] = useState(queryMonth);

  const template = useMemo(() => templates.find(t => t.id === templateId), [templates, templateId]);
  const existingSubmission = useMemo(() =>
    currentUser ? getSubmissionForUser(currentUser.id, templateId!, selectedMonth, CURRENT_YEAR) : undefined,
    [currentUser, templateId, selectedMonth, getSubmissionForUser]
  );

  const [formData, setFormData] = useState<Record<string, string>>(existingSubmission?.data ?? {});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(existingSubmission?.status === 'submitted');
  const [loading, setLoading] = useState(false);
  const [fileNames, setFileNames] = useState<Record<string, string>>({});

  if (!template || !currentUser) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>Template not found.</p>
        <button onClick={() => navigate('/user/reports')} className="mt-3 text-blue-600 hover:underline text-sm">
          ← Back to reports
        </button>
      </div>
    );
  }

  const currentStatus = existingSubmission?.status ?? 'not_started';
  const statusCfg = STATUS_CONFIG[currentStatus as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.not_started;
  const isSubmitted = currentStatus === 'submitted';

  const sortedFields = [...template.fields].sort((a, b) => a.order - b.order);

  const validate = () => {
    const errs: Record<string, string> = {};
    sortedFields.forEach(field => {
      if (field.required && !formData[field.id]?.trim() && !fileNames[field.id]) {
        errs[field.id] = `${field.label} is required`;
      }
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));

    // Merge file names into formData for storage
    const mergedData = { ...formData };
    Object.entries(fileNames).forEach(([k, v]) => { mergedData[k] = v; });

    addSubmission({
      userId: currentUser.id,
      templateId: template.id,
      status: 'submitted',
      submissionDate: new Date().toISOString().split('T')[0],
      month: selectedMonth,
      year: CURRENT_YEAR,
      data: mergedData,
    });
    setSubmitted(true);
    setLoading(false);
  };

  const handleSaveDraft = () => {
    const mergedData = { ...formData };
    Object.entries(fileNames).forEach(([k, v]) => { mergedData[k] = v; });
    addSubmission({
      userId: currentUser.id,
      templateId: template.id,
      status: 'pending',
      submissionDate: null,
      month: selectedMonth,
      year: CURRENT_YEAR,
      data: mergedData,
    });
    alert('Draft saved!');
  };

  const handleFileChange = (fieldId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileNames(prev => ({ ...prev, [fieldId]: file.name }));
      setErrors(prev => ({ ...prev, [fieldId]: '' }));
    }
  };

  const completionPercent = useMemo(() => {
    const required = sortedFields.filter(f => f.required);
    if (required.length === 0) return 100;
    const filled = required.filter(f => formData[f.id]?.trim() || fileNames[f.id]);
    return Math.round((filled.length / required.length) * 100);
  }, [sortedFields, formData, fileNames]);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate('/user/reports')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Reports
      </button>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-5">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-xs">{template.shortCode}</span>
                <span className="text-blue-200 text-xs">{MONTHS[selectedMonth - 1]} {CURRENT_YEAR}</span>
              </div>
              <h2 className="text-white">{template.title}</h2>
              <p className="text-blue-200 text-xs mt-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Deadline: {template.deadline}
              </p>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${statusCfg.cls}`}>
              {statusCfg.icon}
              <span className="text-sm">{statusCfg.label}</span>
            </div>
          </div>
        </div>

        {/* Progress */}
        {!isSubmitted && (
          <div className="px-6 py-3 border-b border-gray-50 flex items-center gap-3">
            <span className="text-xs text-gray-500">Completion</span>
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">{completionPercent}%</span>
          </div>
        )}
      </div>

      {/* Success state */}
      {submitted && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center mb-5">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <h3 className="text-green-800">Report Submitted Successfully!</h3>
          <p className="text-green-600 text-sm mt-1">
            Your {template.shortCode} for {MONTHS[selectedMonth - 1]} {CURRENT_YEAR} has been submitted.
          </p>
          <div className="flex gap-3 justify-center mt-4">
            <button
              onClick={() => navigate('/user/reports')}
              className="px-4 py-2 bg-white border border-green-200 text-green-700 rounded-lg text-sm hover:bg-green-50 transition-colors"
            >
              ← Back to Reports
            </button>
            <button
              onClick={() => { setSubmitted(false); setFormData({}); setFileNames({}); }}
              className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              Resubmit
            </button>
          </div>
        </div>
      )}

      {/* Form */}
      {!submitted && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User info */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm shrink-0">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <p className="text-blue-800 text-sm">{currentUser.name}</p>
              <p className="text-blue-600 text-xs">{currentUser.office} · Emp. #{currentUser.number}</p>
            </div>
          </div>

          {/* Existing submission notice */}
          {existingSubmission && currentStatus !== 'submitted' && (
            <div className={`flex items-center gap-2 p-3 rounded-xl border ${statusCfg.banner}`}>
              {statusCfg.icon}
              <p className="text-sm text-gray-700">
                You have a <span className="font-medium">{statusCfg.label}</span> draft for this report. Fields are pre-filled.
              </p>
            </div>
          )}

          {/* Dynamic fields */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-5">
            <h3 className="text-gray-700 text-sm border-b border-gray-50 pb-2">
              Report Information
              <span className="text-gray-400 text-xs ml-2">({sortedFields.filter(f => f.required).length} required fields)</span>
            </h3>

            {sortedFields.map(field => (
              <div key={field.id}>
                <label className="flex items-center gap-1.5 text-sm text-gray-700 mb-1.5">
                  <span className="text-gray-400">{FIELD_ICONS[field.type]}</span>
                  {field.label}
                  {field.required && <span className="text-red-400">*</span>}
                  {!field.required && <span className="text-gray-300 text-xs">(optional)</span>}
                </label>

                {/* Text input */}
                {field.type === 'text' && (
                  <textarea
                    value={formData[field.id] ?? ''}
                    onChange={e => {
                      setFormData(prev => ({ ...prev, [field.id]: e.target.value }));
                      setErrors(prev => ({ ...prev, [field.id]: '' }));
                    }}
                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                    rows={2}
                    className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${errors[field.id] ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                  />
                )}

                {/* Number input */}
                {field.type === 'number' && (
                  <input
                    type="number"
                    value={formData[field.id] ?? ''}
                    onChange={e => {
                      setFormData(prev => ({ ...prev, [field.id]: e.target.value }));
                      setErrors(prev => ({ ...prev, [field.id]: '' }));
                    }}
                    placeholder="0.00"
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[field.id] ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                  />
                )}

                {/* Date input */}
                {field.type === 'date' && (
                  <input
                    type="date"
                    value={formData[field.id] ?? ''}
                    onChange={e => {
                      setFormData(prev => ({ ...prev, [field.id]: e.target.value }));
                      setErrors(prev => ({ ...prev, [field.id]: '' }));
                    }}
                    className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[field.id] ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                  />
                )}

                {/* Dropdown */}
                {field.type === 'dropdown' && (
                  <select
                    value={formData[field.id] ?? ''}
                    onChange={e => {
                      setFormData(prev => ({ ...prev, [field.id]: e.target.value }));
                      setErrors(prev => ({ ...prev, [field.id]: '' }));
                    }}
                    className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${errors[field.id] ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                  >
                    <option value="">Select {field.label}...</option>
                    {(field.options ?? []).map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                )}

                {/* File upload */}
                {field.type === 'file' && (
                  <div className={`relative border-2 border-dashed rounded-xl transition-colors ${errors[field.id] ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30'}`}>
                    <input
                      type="file"
                      id={`file-${field.id}`}
                      onChange={e => handleFileChange(field.id, e)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                    />
                    <div className="p-4 text-center pointer-events-none">
                      {fileNames[field.id] ? (
                        <div className="flex items-center justify-center gap-2">
                          <FileText className="w-4 h-4 text-blue-500" />
                          <span className="text-sm text-blue-700">{fileNames[field.id]}</span>
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        </div>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                          <p className="text-sm text-gray-500">Click to upload or drag & drop</p>
                          <p className="text-xs text-gray-400">PDF, DOC, XLS, JPG, PNG accepted</p>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Error message */}
                {errors[field.id] && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                    <p className="text-red-500 text-xs">{errors[field.id]}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Validation error summary */}
          {Object.keys(errors).length > 0 && (
            <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-red-700 text-sm">Please fix the following errors before submitting:</p>
                <ul className="mt-1 space-y-0.5">
                  {Object.values(errors).map((e, i) => (
                    <li key={i} className="text-red-600 text-xs">• {e}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 pb-6">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors"
            >
              Save as Draft
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm transition-colors"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

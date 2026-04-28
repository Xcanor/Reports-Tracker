import { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { OFFICES, OFFICE_CODES } from '../../data/mockData';
import type { AppUser } from '../../types';
import {
  Upload, X, CheckCircle2, AlertCircle, FileSpreadsheet,
  Users, Download, Eye, RotateCcw
} from 'lucide-react';

interface PreviewUser {
  name: string;
  office: string;
  number: string;
  valid: boolean;
  errors: string[];
}

// Simulate Excel parsing: in production, use SheetJS (xlsx package)
function parseCSVContent(content: string): PreviewUser[] {
  const lines = content.trim().split('\n');
  return lines.slice(1).map(line => {
    const [name = '', office = '', number = ''] = line.split(',').map(s => s.trim().replace(/^"|"$/g, ''));
    const errors: string[] = [];
    if (!name) errors.push('Name is required');
    if (!office) errors.push('Office is required');
    else if (!['RO-HQ', ...OFFICE_CODES].includes(office)) errors.push(`Unknown office "${office}"`);
    if (!number) errors.push('Number is required');
    return { name, office, number, valid: errors.length === 0, errors };
  }).filter(r => r.name || r.office || r.number);
}

const SAMPLE_CSV = `name,office,number
Jose Rizal,LEY,008
Andres Bonifacio,SLPO,009
Emilio Aguinaldo,BIL,010
Apolinario Mabini,SAM,011
Marcela Agoncillo,ESPO,012
Gregoria de Jesus,NSPO,013`;

export default function ExcelUploadPage() {
  const { importUsers, templates } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [previewData, setPreviewData] = useState<PreviewUser[]>([]);
  const [imported, setImported] = useState(false);
  const [assignTemplates, setAssignTemplates] = useState<string[]>([]);

  const handleFile = (file: File) => {
    setFileName(file.name);
    setImported(false);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const parsed = parseCSVContent(content);
      setPreviewData(parsed);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleImport = () => {
    const valid = previewData.filter(u => u.valid);
    const users = valid.map(u => ({
      name: u.name,
      office: u.office,
      number: u.number,
      role: 'user' as const,
      assignedTemplates: assignTemplates,
    }));
    importUsers(users);
    setImported(true);
  };

  const handleLoadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
    const file = new File([blob], 'sample_users.csv', { type: 'text/csv' });
    handleFile(file);
    setFileName('sample_users.csv (demo)');
  };

  const handleReset = () => {
    setPreviewData([]);
    setFileName('');
    setImported(false);
    setAssignTemplates([]);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleDownloadTemplate = () => {
    const link = document.createElement('a');
    link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(SAMPLE_CSV)}`;
    link.download = 'user_import_template.csv';
    link.click();
  };

  const validCount = previewData.filter(u => u.valid).length;
  const invalidCount = previewData.filter(u => !u.valid).length;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-gray-800">Excel / CSV Import</h2>
        <p className="text-gray-400 text-sm mt-0.5">Import users from a spreadsheet file</p>
        {/* Backend note */}
        <div className="mt-2 flex items-start gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg">
          <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-600">
            <span className="font-medium">Backend note:</span> In production, use the SheetJS (xlsx) library to parse .xlsx/.xls files. 
            This demo accepts CSV format. The parsed data would be sent to <code className="bg-blue-100 px-1 rounded">POST /api/users/import</code>.
          </p>
        </div>
      </div>

      {/* Download template */}
      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100">
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="w-5 h-5 text-green-600" />
          <div>
            <p className="text-sm text-gray-700">Download Import Template</p>
            <p className="text-xs text-gray-400">Required columns: name, office, number</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleLoadSample}
            className="px-3 py-1.5 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors"
          >
            Load Demo Data
          </button>
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg hover:bg-green-100 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Template
          </button>
        </div>
      </div>

      {/* Upload zone */}
      {!previewData.length && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
          }`}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={handleInputChange}
          />
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Upload className="w-7 h-7 text-gray-400" />
          </div>
          <p className="text-gray-600 mb-1">Drop your file here, or click to browse</p>
          <p className="text-gray-400 text-sm">Supports .csv, .xlsx, .xls files</p>
        </div>
      )}

      {/* Preview */}
      {previewData.length > 0 && (
        <div className="space-y-4">
          {/* File info */}
          <div className="flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-gray-100">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-700">{fileName}</p>
                <p className="text-xs text-gray-400">
                  {previewData.length} rows detected · {validCount} valid · {invalidCount} invalid
                </p>
              </div>
            </div>
            <button onClick={handleReset} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Assign templates */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <h4 className="text-sm text-gray-700 mb-2">Assign Report Templates to Imported Users (optional)</h4>
            <div className="flex flex-wrap gap-2">
              {templates.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setAssignTemplates(prev =>
                    prev.includes(t.id) ? prev.filter(x => x !== t.id) : [...prev, t.id]
                  )}
                  className={`px-3 py-1.5 rounded-lg border text-xs transition-colors ${
                    assignTemplates.includes(t.id)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {t.shortCode}
                </button>
              ))}
            </div>
          </div>

          {/* Preview table */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2">
              <Eye className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-700">Preview</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-5 py-3 text-xs text-gray-500 font-medium">#</th>
                    <th className="px-5 py-3 text-xs text-gray-500 font-medium">Name</th>
                    <th className="px-5 py-3 text-xs text-gray-500 font-medium">Office</th>
                    <th className="px-5 py-3 text-xs text-gray-500 font-medium">Number</th>
                    <th className="px-5 py-3 text-xs text-gray-500 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {previewData.map((row, i) => (
                    <tr key={i} className={row.valid ? '' : 'bg-red-50/30'}>
                      <td className="px-5 py-3 text-gray-400 text-xs">{i + 1}</td>
                      <td className="px-5 py-3 text-gray-800">{row.name || <span className="text-gray-300">—</span>}</td>
                      <td className="px-5 py-3">
                        {row.office
                          ? <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs">{row.office}</span>
                          : <span className="text-gray-300 text-xs">—</span>}
                      </td>
                      <td className="px-5 py-3 text-gray-500 font-mono text-xs">{row.number || '—'}</td>
                      <td className="px-5 py-3">
                        {row.valid ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Valid
                          </span>
                        ) : (
                          <div>
                            <span className="inline-flex items-center gap-1 text-xs text-red-500">
                              <AlertCircle className="w-3.5 h-3.5" /> Invalid
                            </span>
                            <ul className="mt-0.5 space-y-0.5">
                              {row.errors.map((e, ei) => (
                                <li key={ei} className="text-xs text-red-400">• {e}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Import button */}
          {imported ? (
            <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-green-700 text-sm">{validCount} users imported successfully!</p>
                <p className="text-green-600 text-xs mt-0.5">They can now log in to the system.</p>
              </div>
              <button
                onClick={handleReset}
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-white border border-green-200 text-green-700 text-sm rounded-lg hover:bg-green-50 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Import more
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={validCount === 0}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg text-sm transition-colors"
              >
                <Users className="w-4 h-4" />
                Import {validCount} Valid User{validCount !== 1 ? 's' : ''}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

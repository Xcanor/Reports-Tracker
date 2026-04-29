import type { AppUser, ReportTemplate, Submission, AppNotification } from '../types';

export const OFFICES = [
  { code: 'LEY', name: 'LEYTE' },
  { code: 'SLPO', name: 'SOUTHERN LEYTE' },
  { code: 'BIL', name: 'BILIRAN' },
  { code: 'SAM', name: 'SAMAR' },
  { code: 'ESPO', name: 'EASTERN SAMAR' },
  { code: 'NSPO', name: 'NORTHERN SAMAR' }
];

export const DIVISIONS = [
  { code: 'FAD', name: 'FINANCE AND ADMINISTRATIVE DIVISION' },
  { code: 'BDD', name: 'BUSINESS DEVELOPMENT DIVISION' },
  { code: 'CPD', name: 'CONSUMER PROTECTION DIVISION' },
  { code: 'ORD', name: 'OFFICE OF THE REGIONAL DIRECTOR' }
];

export const OFFICE_CODES = OFFICES.map(o => o.code);
export const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export const mockUsers: AppUser[] = [
  {
    id: 'admin-1',
    name: 'Maria Santos',
    email: 'maria.santos@dti.gov.ph',
    mobile: '+639171234567',
    office: 'RO-HQ',
    division: 'FAD',
    number: '001',
    role: 'admin',
    assignedTemplates: [],
    createdAt: '2026-01-01',
    password: 'admin123',
  },
  {
    id: 'user-1',
    name: 'Juan dela Cruz',
    email: 'juan.delacruz@dti.gov.ph',
    mobile: '+639171111111',
    office: 'LEY',
    division: 'FAD',
    number: '002',
    role: 'user',
    assignedTemplates: ['crr', 'cibr', 'dtr', 'brs'],
    createdAt: '2026-01-15',
    password: 'user123',
  },
  {
    id: 'user-2',
    name: 'Ana Reyes',
    email: 'ana.reyes@dti.gov.ph',
    mobile: '+639172222222',
    office: 'SLPO',
    division: 'BDD',
    number: '003',
    role: 'user',
    assignedTemplates: ['crr', 'cibr', 'brs', 'dtr', 'mrtfc'],
    createdAt: '2026-01-15',
    password: 'user123',
  },
  {
    id: 'user-3',
    name: 'Pedro Lim',
    email: 'pedro.lim@dti.gov.ph',
    mobile: '+639173333333',
    office: 'BIL',
    division: 'CPD',
    number: '004',
    role: 'user',
    assignedTemplates: ['dtr', 'crta', 'iar', 'poc'],
    createdAt: '2026-02-01',
    password: 'user123',
  },
  {
    id: 'user-4',
    name: 'Rosa Diaz',
    email: 'rosa.diaz@dti.gov.ph',
    mobile: '+639174444444',
    office: 'SAM',
    division: 'BDD',
    number: '005',
    role: 'user',
    assignedTemplates: ['crr', 'dtr', 'mrtfc', 'lca'],
    createdAt: '2026-02-01',
    password: 'user123',
  },
  {
    id: 'user-5',
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@dti.gov.ph',
    mobile: '+639175555555',
    office: 'ESPO',
    division: 'CPD',
    number: '006',
    role: 'user',
    assignedTemplates: ['brs', 'poc', 'dtr', 'crta'],
    createdAt: '2026-02-15',
    password: 'user123',
  },
  {
    id: 'user-6',
    name: 'Elena Torres',
    email: 'elena.torres@dti.gov.ph',
    mobile: '+639176666666',
    office: 'NSPO',
    division: 'ORD',
    number: '007',
    role: 'user',
    assignedTemplates: ['crr', 'cibr', 'dtr', 'mrtfc', 'brs'],
    createdAt: '2026-03-01',
    password: 'user123',
  },
];

export const mockTemplates: ReportTemplate[] = [
  {
    id: 'crr',
    title: 'Cash Receipts Register',
    shortCode: 'CRR',
    deadline: 'Every last working day of the month',
    createdAt: '2026-01-01',
    fields: [
      { id: 'f1', label: 'Report Date', type: 'date', required: true, order: 0 },
      { id: 'f2', label: 'Total Receipts Amount (PHP)', type: 'number', required: true, order: 1 },
      { id: 'f3', label: 'Summary / Remarks', type: 'text', required: false, order: 2 },
      { id: 'f4', label: 'Supporting Documents', type: 'file', required: true, order: 3 },
    ],
  },
  {
    id: 'cibr',
    title: 'Cash in Bank Register',
    shortCode: 'CIBR',
    deadline: 'Every last working day of the month',
    createdAt: '2026-01-01',
    fields: [
      { id: 'f1', label: 'Report Date', type: 'date', required: true, order: 0 },
      { id: 'f2', label: 'Bank Name', type: 'text', required: true, order: 1 },
      { id: 'f3', label: 'Balance Amount (PHP)', type: 'number', required: true, order: 2 },
      { id: 'f4', label: 'Bank Statement', type: 'file', required: true, order: 3 },
    ],
  },
  {
    id: 'lca',
    title: 'Liquidation of Cash Advances',
    shortCode: 'LCA',
    deadline: 'Thirty (30) calendar days from completion of activity or return from official travel',
    createdAt: '2026-01-01',
    fields: [
      { id: 'f1', label: 'Activity / Travel Date', type: 'date', required: true, order: 0 },
      { id: 'f2', label: 'Amount Advanced (PHP)', type: 'number', required: true, order: 1 },
      { id: 'f3', label: 'Amount Spent (PHP)', type: 'number', required: true, order: 2 },
      { id: 'f4', label: 'Purpose of Activity', type: 'text', required: true, order: 3 },
      { id: 'f5', label: 'Liquidation Documents', type: 'file', required: true, order: 4 },
    ],
  },
  {
    id: 'crta',
    title: 'Claim for Representation and Transportation Allowance',
    shortCode: 'CRTA',
    deadline: 'Every 10th day of the month',
    createdAt: '2026-01-01',
    fields: [
      { id: 'f1', label: 'Claim Period (From)', type: 'date', required: true, order: 0 },
      { id: 'f2', label: 'Representation Allowance (PHP)', type: 'number', required: true, order: 1 },
      { id: 'f3', label: 'Transportation Allowance (PHP)', type: 'number', required: true, order: 2 },
      { id: 'f4', label: 'Mode of Transportation', type: 'dropdown', required: true, options: ['Personal Vehicle', 'Public Transport', 'Official Vehicle', 'Others'], order: 3 },
      { id: 'f5', label: 'Supporting Documents', type: 'file', required: false, order: 4 },
    ],
  },
  {
    id: 'brs',
    title: 'Bank Reconciliation Statements',
    shortCode: 'BRS',
    deadline: '20th day of the following month',
    createdAt: '2026-01-01',
    fields: [
      { id: 'f1', label: 'Bank Name', type: 'text', required: true, order: 0 },
      { id: 'f2', label: 'Statement Date', type: 'date', required: true, order: 1 },
      { id: 'f3', label: 'Book Balance (PHP)', type: 'number', required: true, order: 2 },
      { id: 'f4', label: 'Bank Balance (PHP)', type: 'number', required: true, order: 3 },
      { id: 'f5', label: 'Reconciliation Documents', type: 'file', required: true, order: 4 },
    ],
  },
  {
    id: 'poc',
    title: 'Purchase Orders and Contracts',
    shortCode: 'POC',
    deadline: 'Within five (5) days from approval; sent online, original copy with supporting documents every last working day',
    createdAt: '2026-01-01',
    fields: [
      { id: 'f1', label: 'PO / Contract Number', type: 'text', required: true, order: 0 },
      { id: 'f2', label: 'Date Issued', type: 'date', required: true, order: 1 },
      { id: 'f3', label: 'Supplier / Contractor', type: 'text', required: true, order: 2 },
      { id: 'f4', label: 'Total Amount (PHP)', type: 'number', required: true, order: 3 },
      { id: 'f5', label: 'Document Type', type: 'dropdown', required: true, options: ['Purchase Order', 'Contract', 'Job Order', 'MOA'], order: 4 },
      { id: 'f6', label: 'PO / Contract Documents', type: 'file', required: true, order: 5 },
    ],
  },
  {
    id: 'iar',
    title: 'Inspection and Acceptance Report',
    shortCode: 'IAR',
    deadline: 'Within twenty-four (24) hours from delivery and inspection; sent online, original copy with supporting documents every last working day',
    createdAt: '2026-01-01',
    fields: [
      { id: 'f1', label: 'Date of Delivery', type: 'date', required: true, order: 0 },
      { id: 'f2', label: 'Item / Equipment Description', type: 'text', required: true, order: 1 },
      { id: 'f3', label: 'Quantity Delivered', type: 'number', required: true, order: 2 },
      { id: 'f4', label: 'Unit Cost (PHP)', type: 'number', required: false, order: 3 },
      { id: 'f5', label: 'Inspection Report Document', type: 'file', required: true, order: 4 },
      { id: 'f6', label: 'Remarks', type: 'text', required: false, order: 5 },
    ],
  },
  {
    id: 'dtr',
    title: 'Daily Time Record',
    shortCode: 'DTR',
    deadline: 'Every 10th day of the following month',
    createdAt: '2026-01-01',
    fields: [
      { id: 'f1', label: 'Month Covered', type: 'date', required: true, order: 0 },
      { id: 'f2', label: 'Total Days Present', type: 'number', required: true, order: 1 },
      { id: 'f3', label: 'Total Absences (days)', type: 'number', required: false, order: 2 },
      { id: 'f4', label: 'Total Tardiness (minutes)', type: 'number', required: false, order: 3 },
      { id: 'f5', label: 'DTR Document', type: 'file', required: true, order: 4 },
    ],
  },
  {
    id: 'mrtfc',
    title: 'Monthly Report of Travels and Fuel Consumption',
    shortCode: 'MRTFC',
    deadline: 'Every 5th day of the following month',
    createdAt: '2026-01-01',
    fields: [
      { id: 'f1', label: 'Month Covered', type: 'date', required: true, order: 0 },
      { id: 'f2', label: 'Total Kilometers Traveled', type: 'number', required: true, order: 1 },
      { id: 'f3', label: 'Total Fuel Consumed (Liters)', type: 'number', required: true, order: 2 },
      { id: 'f4', label: 'Destinations Visited', type: 'text', required: true, order: 3 },
      { id: 'f5', label: 'Travel Report Document', type: 'file', required: false, order: 4 },
    ],
  },
];

export const mockSubmissions: Submission[] = [
  // CRR - April 2026
  { id: 's1', userId: 'user-1', templateId: 'crr', status: 'submitted', submissionDate: '2026-04-25', month: 4, year: 2026, data: { f1: '2026-04-30', f2: '125000', f3: 'April receipts complete', f4: 'crr_ley_apr.pdf' } },
  { id: 's2', userId: 'user-2', templateId: 'crr', status: 'submitted', submissionDate: '2026-04-24', month: 4, year: 2026, data: { f1: '2026-04-30', f2: '98500', f3: '', f4: 'crr_slpo_apr.pdf' } },
  { id: 's3', userId: 'user-4', templateId: 'crr', status: 'pending', submissionDate: null, month: 4, year: 2026, data: {} },
  { id: 's4', userId: 'user-6', templateId: 'crr', status: 'not_started', submissionDate: null, month: 4, year: 2026, data: {} },
  // CRR - March 2026
  { id: 's5', userId: 'user-1', templateId: 'crr', status: 'submitted', submissionDate: '2026-03-28', month: 3, year: 2026, data: {} },
  { id: 's6', userId: 'user-2', templateId: 'crr', status: 'submitted', submissionDate: '2026-03-27', month: 3, year: 2026, data: {} },
  { id: 's7', userId: 'user-4', templateId: 'crr', status: 'submitted', submissionDate: '2026-03-29', month: 3, year: 2026, data: {} },
  { id: 's8', userId: 'user-6', templateId: 'crr', status: 'late', submissionDate: null, month: 3, year: 2026, data: {} },
  // CIBR - April 2026
  { id: 's9', userId: 'user-1', templateId: 'cibr', status: 'submitted', submissionDate: '2026-04-25', month: 4, year: 2026, data: {} },
  { id: 's10', userId: 'user-2', templateId: 'cibr', status: 'pending', submissionDate: null, month: 4, year: 2026, data: {} },
  { id: 's11', userId: 'user-6', templateId: 'cibr', status: 'not_started', submissionDate: null, month: 4, year: 2026, data: {} },
  // DTR - March 2026
  { id: 's12', userId: 'user-1', templateId: 'dtr', status: 'submitted', submissionDate: '2026-04-10', month: 3, year: 2026, data: {} },
  { id: 's13', userId: 'user-2', templateId: 'dtr', status: 'late', submissionDate: null, month: 3, year: 2026, data: {} },
  { id: 's14', userId: 'user-3', templateId: 'dtr', status: 'submitted', submissionDate: '2026-04-09', month: 3, year: 2026, data: {} },
  { id: 's15', userId: 'user-4', templateId: 'dtr', status: 'submitted', submissionDate: '2026-04-10', month: 3, year: 2026, data: {} },
  { id: 's16', userId: 'user-5', templateId: 'dtr', status: 'late', submissionDate: null, month: 3, year: 2026, data: {} },
  { id: 's17', userId: 'user-6', templateId: 'dtr', status: 'submitted', submissionDate: '2026-04-08', month: 3, year: 2026, data: {} },
  // DTR - April 2026
  { id: 's18', userId: 'user-1', templateId: 'dtr', status: 'pending', submissionDate: null, month: 4, year: 2026, data: {} },
  { id: 's19', userId: 'user-3', templateId: 'dtr', status: 'not_started', submissionDate: null, month: 4, year: 2026, data: {} },
  { id: 's20', userId: 'user-5', templateId: 'dtr', status: 'not_started', submissionDate: null, month: 4, year: 2026, data: {} },
  // BRS
  { id: 's21', userId: 'user-1', templateId: 'brs', status: 'submitted', submissionDate: '2026-04-15', month: 3, year: 2026, data: {} },
  { id: 's22', userId: 'user-2', templateId: 'brs', status: 'submitted', submissionDate: '2026-04-14', month: 3, year: 2026, data: {} },
  { id: 's23', userId: 'user-5', templateId: 'brs', status: 'pending', submissionDate: null, month: 4, year: 2026, data: {} },
  { id: 's24', userId: 'user-6', templateId: 'brs', status: 'not_started', submissionDate: null, month: 4, year: 2026, data: {} },
  // MRTFC
  { id: 's25', userId: 'user-4', templateId: 'mrtfc', status: 'submitted', submissionDate: '2026-04-05', month: 3, year: 2026, data: {} },
  { id: 's26', userId: 'user-6', templateId: 'mrtfc', status: 'not_started', submissionDate: null, month: 4, year: 2026, data: {} },
  { id: 's27', userId: 'user-2', templateId: 'mrtfc', status: 'pending', submissionDate: null, month: 4, year: 2026, data: {} },
  // CRTA
  { id: 's28', userId: 'user-3', templateId: 'crta', status: 'submitted', submissionDate: '2026-04-10', month: 4, year: 2026, data: {} },
  { id: 's29', userId: 'user-5', templateId: 'crta', status: 'not_started', submissionDate: null, month: 4, year: 2026, data: {} },
  // IAR
  { id: 's30', userId: 'user-3', templateId: 'iar', status: 'not_started', submissionDate: null, month: 4, year: 2026, data: {} },
  // POC
  { id: 's31', userId: 'user-5', templateId: 'poc', status: 'submitted', submissionDate: '2026-04-20', month: 4, year: 2026, data: {} },
  { id: 's32', userId: 'user-3', templateId: 'poc', status: 'pending', submissionDate: null, month: 4, year: 2026, data: {} },
  // LCA
  { id: 's33', userId: 'user-4', templateId: 'lca', status: 'submitted', submissionDate: '2026-04-18', month: 4, year: 2026, data: {} },
];

export const mockNotifications: AppNotification[] = [
  { id: 'n1', userId: 'user-1', message: 'DTR for April 2026 is due on May 10, 2026', type: 'deadline', read: false, createdAt: '2026-04-28T08:00:00' },
  { id: 'n2', userId: 'user-1', message: 'Cash Receipts Register for April 2026 is still pending', type: 'missing', read: false, createdAt: '2026-04-28T08:01:00' },
  { id: 'n3', userId: 'user-2', message: 'CIBR for April 2026 is still pending submission', type: 'missing', read: false, createdAt: '2026-04-28T08:02:00' },
  { id: 'n4', userId: 'user-2', message: 'DTR for March 2026 is overdue — LATE', type: 'late', read: true, createdAt: '2026-04-12T09:00:00' },
  { id: 'n5', userId: 'user-3', message: 'IAR for April 2026 has not been started', type: 'missing', read: false, createdAt: '2026-04-28T08:00:00' },
  { id: 'n6', userId: 'user-5', message: 'DTR for March 2026 is overdue — LATE', type: 'late', read: false, createdAt: '2026-04-12T09:00:00' },
  { id: 'n7', userId: 'user-6', message: 'CRR for March 2026 is overdue — LATE', type: 'late', read: true, createdAt: '2026-04-02T09:00:00' },
  { id: 'n8', userId: 'admin-1', message: 'Elena Torres (NSPO) has not submitted CRR for April 2026', type: 'missing', read: false, createdAt: '2026-04-28T08:00:00' },
  { id: 'n9', userId: 'admin-1', message: 'Carlos Mendoza (ESPO) DTR for March 2026 is overdue', type: 'late', read: false, createdAt: '2026-04-15T08:00:00' },
  { id: 'n10', userId: 'admin-1', message: 'Juan dela Cruz submitted CRR for April 2026', type: 'submitted', read: true, createdAt: '2026-04-25T10:30:00' },
];

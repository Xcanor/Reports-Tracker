import { useState } from 'react';
import { Bell, Shield, Globe, Save } from 'lucide-react';

interface SystemSettings {
  notifications: {
    emailReminders: boolean;
    smsReminders: boolean;
    overdueAlerts: boolean;
    weeklySummary: boolean;
    inAppNotifications: boolean;
    remindDaysBefore: number;
  };
  submissionRules: {
    requireOfficeField: boolean;
    allowSelfSubmission: boolean;
    lockAfterDeadline: boolean;
  };
  localization: {
    timezone: string;
    dateFormat: string;
    language: string;
  };
}

const initialSettings: SystemSettings = {
  notifications: {
    emailReminders: true,
    smsReminders: false,
    overdueAlerts: true,
    weeklySummary: true,
    inAppNotifications: true,
    remindDaysBefore: 3,
  },
  submissionRules: {
    requireOfficeField: true,
    allowSelfSubmission: true,
    lockAfterDeadline: false,
  },
  localization: {
    timezone: 'Asia/Riyadh (GMT+3)',
    dateFormat: '2026-04-28',
    language: 'English',
  },
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>(initialSettings);
  const [saved, setSaved] = useState(false);

  const handleToggle = (section: keyof SystemSettings, key: string) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: !prev[section][key as keyof typeof prev[typeof section]],
      },
    }));
    setSaved(false);
  };

  const handleNumberChange = (section: keyof SystemSettings, key: string, value: number) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
    setSaved(false);
  };

  const handleSelectChange = (section: keyof SystemSettings, key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
    setSaved(false);
  };

  const handleSave = () => {
    // In production, this would send to backend
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 max-w-screen-xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-800">System Settings</h2>
          <p className="text-gray-400 text-sm mt-0.5">Configure system behavior and notification preferences</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>

      {/* Success Message */}
      {saved && (
        <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-600 text-sm">
          ✓ Settings saved successfully
        </div>
      )}

      {/* Notification Settings */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <Bell className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-gray-800 font-medium">Notification Settings</h3>
        </div>

        {/* Email Reminders */}
        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div>
            <p className="text-gray-800 text-sm font-medium">Email Reminders</p>
            <p className="text-gray-400 text-xs mt-1">Send reminder emails to users before their deadline</p>
          </div>
          <button
            onClick={() => handleToggle('notifications', 'emailReminders')}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              settings.notifications.emailReminders ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                settings.notifications.emailReminders ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* SMS Reminders */}
        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div>
            <p className="text-gray-800 text-sm font-medium">SMS Reminders</p>
            <p className="text-gray-400 text-xs mt-1">Send SMS text messages for upcoming deadlines</p>
          </div>
          <button
            onClick={() => handleToggle('notifications', 'smsReminders')}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              settings.notifications.smsReminders ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                settings.notifications.smsReminders ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Overdue Alerts */}
        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div>
            <p className="text-gray-800 text-sm font-medium">Overdue Alerts</p>
            <p className="text-gray-400 text-xs mt-1">Automatically alert admins when reports are overdue</p>
          </div>
          <button
            onClick={() => handleToggle('notifications', 'overdueAlerts')}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              settings.notifications.overdueAlerts ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                settings.notifications.overdueAlerts ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Weekly Summary */}
        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div>
            <p className="text-gray-800 text-sm font-medium">Weekly Summary</p>
            <p className="text-gray-400 text-xs mt-1">Send weekly submission summary to admins</p>
          </div>
          <button
            onClick={() => handleToggle('notifications', 'weeklySummary')}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              settings.notifications.weeklySummary ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                settings.notifications.weeklySummary ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* In-App Notifications */}
        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div>
            <p className="text-gray-800 text-sm font-medium">In-App Notifications</p>
            <p className="text-gray-400 text-xs mt-1">Show notifications within the dashboard</p>
          </div>
          <button
            onClick={() => handleToggle('notifications', 'inAppNotifications')}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              settings.notifications.inAppNotifications ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                settings.notifications.inAppNotifications ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Remind Before */}
        <div className="flex items-center justify-between pt-3">
          <div>
            <p className="text-gray-800 text-sm font-medium">Reminder Timing</p>
            <p className="text-gray-400 text-xs mt-1">Send reminders how many days before deadline</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={settings.notifications.remindDaysBefore}
              onChange={e => handleNumberChange('notifications', 'remindDaysBefore', parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[1, 2, 3, 5, 7].map(day => (
                <option key={day} value={day}>
                  {day} day{day > 1 ? 's' : ''}
                </option>
              ))}
            </select>
            <span className="text-gray-500 text-sm">before deadline</span>
          </div>
        </div>
      </div>

      {/* Submission Rules */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
            <Shield className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-gray-800 font-medium">Submission Rules</h3>
        </div>

        {/* Require Office Field */}
        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div>
            <p className="text-gray-800 text-sm font-medium">Require Office Field</p>
            <p className="text-gray-400 text-xs mt-1">Office/department must be specified when logging in</p>
          </div>
          <button
            onClick={() => handleToggle('submissionRules', 'requireOfficeField')}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              settings.submissionRules.requireOfficeField ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                settings.submissionRules.requireOfficeField ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Allow Self-Submission */}
        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div>
            <p className="text-gray-800 text-sm font-medium">Allow Self-Submission</p>
            <p className="text-gray-400 text-xs mt-1">Users can mark their own reports as submitted</p>
          </div>
          <button
            onClick={() => handleToggle('submissionRules', 'allowSelfSubmission')}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              settings.submissionRules.allowSelfSubmission ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                settings.submissionRules.allowSelfSubmission ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Lock After Deadline */}
        <div className="flex items-center justify-between pt-3">
          <div>
            <p className="text-gray-800 text-sm font-medium">Lock After Deadline</p>
            <p className="text-gray-400 text-xs mt-1">Prevent report submission after the deadline has passed</p>
          </div>
          <button
            onClick={() => handleToggle('submissionRules', 'lockAfterDeadline')}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              settings.submissionRules.lockAfterDeadline ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                settings.submissionRules.lockAfterDeadline ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Localization */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
            <Globe className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-gray-800 font-medium">Localization</h3>
        </div>

        {/* Timezone */}
        <div className="space-y-2 pb-4 border-b border-gray-100">
          <label className="block text-sm text-gray-800 font-medium">Timezone</label>
          <p className="text-gray-400 text-xs mb-2">Used for deadline calculations and reminders</p>
          <select
            value={settings.localization.timezone}
            onChange={e => handleSelectChange('localization', 'timezone', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>Asia/Riyadh (GMT+3)</option>
            <option>Asia/Manila (GMT+8)</option>
            <option>Asia/Bangkok (GMT+7)</option>
            <option>UTC (GMT+0)</option>
          </select>
        </div>

        {/* Date Format */}
        <div className="space-y-2 pb-4 border-b border-gray-100">
          <label className="block text-sm text-gray-800 font-medium">Date Format</label>
          <p className="text-gray-400 text-xs mb-2">Format used for displaying dates</p>
          <select
            value={settings.localization.dateFormat}
            onChange={e => handleSelectChange('localization', 'dateFormat', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="2026-04-28">2026-04-28 (YYYY-MM-DD)</option>
            <option value="04/28/2026">04/28/2026 (MM/DD/YYYY)</option>
            <option value="28-04-2026">28-04-2026 (DD-MM-YYYY)</option>
          </select>
        </div>

        {/* Language */}
        <div className="space-y-2">
          <label className="block text-sm text-gray-800 font-medium">Language</label>
          <p className="text-gray-400 text-xs mb-2">System interface language</p>
          <select
            value={settings.localization.language}
            onChange={e => handleSelectChange('localization', 'language', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>English</option>
            <option>Filipino</option>
            <option>Spanish</option>
          </select>
        </div>
      </div>

      {/* Backend Info */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-6 text-white">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          💿 Backend Stack (Dev Reference)
        </h4>
        <div className="grid grid-cols-2 gap-6 text-sm">
          <div>
            <p className="text-blue-300 text-xs uppercase tracking-wide mb-3">Frontend</p>
            <p className="font-medium">React + Vite + Tailwind CSS</p>
          </div>
          <div>
            <p className="text-blue-300 text-xs uppercase tracking-wide mb-3">Backend</p>
            <p className="font-medium">Node.js / Express</p>
          </div>
          <div>
            <p className="text-blue-300 text-xs uppercase tracking-wide mb-3">Database</p>
            <p className="font-medium">PostgreSQL / Supabase</p>
          </div>
          <div>
            <p className="text-blue-300 text-xs uppercase tracking-wide mb-3">Excel Parser</p>
            <p className="font-medium">xlsx / SheetJS</p>
          </div>
          <div>
            <p className="text-blue-300 text-xs uppercase tracking-wide mb-3">Auth</p>
            <p className="font-medium">JWT + Role-Based Access</p>
          </div>
          <div>
            <p className="text-blue-300 text-xs uppercase tracking-wide mb-3">Reminders</p>
            <p className="font-medium">Node-cron / Nodemailer</p>
          </div>
        </div>
      </div>
    </div>
  );
}

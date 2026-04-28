import { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router';
import { useApp } from '../context/AppContext';
import { DIVISIONS } from '../data/mockData';
import {
  LayoutDashboard, FileText, Users, ClipboardList, Upload,
  Bell, LogOut, ChevronRight, Menu, X, Shield, User,
  CheckCircle, AlertTriangle, Clock, FileWarning, Settings
} from 'lucide-react';

const adminNavItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/templates', icon: FileText, label: 'Report Templates' },
  { to: '/admin/submissions', icon: ClipboardList, label: 'Submissions' },
  { to: '/admin/users', icon: Users, label: 'User Management' },
  { to: '/admin/upload', icon: Upload, label: 'Excel Import' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

const userNavItems = [
  { to: '/user/dashboard', icon: LayoutDashboard, label: 'My Dashboard' },
  { to: '/user/reports', icon: FileText, label: 'My Reports' },
];

function NotificationPanel({ onClose }: { onClose: () => void }) {
  const { currentUser, notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  if (!currentUser) return null;

  const userNotifs = notifications
    .filter(n => n.userId === currentUser.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const iconMap = {
    deadline: <Clock className="w-4 h-4 text-amber-500" />,
    missing: <FileWarning className="w-4 h-4 text-orange-500" />,
    submitted: <CheckCircle className="w-4 h-4 text-green-500" />,
    late: <AlertTriangle className="w-4 h-4 text-red-500" />,
  };

  const bgMap = {
    deadline: 'bg-amber-50 border-amber-100',
    missing: 'bg-orange-50 border-orange-100',
    submitted: 'bg-green-50 border-green-100',
    late: 'bg-red-50 border-red-100',
  };

  return (
    <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h4 className="text-sm text-gray-800">Notifications</h4>
        <button
          onClick={() => markAllNotificationsRead(currentUser.id)}
          className="text-xs text-blue-600 hover:underline"
        >
          Mark all read
        </button>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {userNotifs.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-sm">No notifications</div>
        ) : (
          userNotifs.map(n => (
            <button
              key={n.id}
              onClick={() => markNotificationRead(n.id)}
              className={`w-full text-left flex items-start gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!n.read ? 'bg-blue-50/50' : ''}`}
            >
              <div className={`p-1.5 rounded-lg border mt-0.5 ${bgMap[n.type]}`}>
                {iconMap[n.type]}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs leading-relaxed ${!n.read ? 'text-gray-800' : 'text-gray-500'}`}>
                  {n.message}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {!n.read && <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export default function AppLayout() {
  const { currentUser, logout, getUnreadCount } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const isAdmin = currentUser?.role === 'admin';
  const navItems = isAdmin ? adminNavItems : userNavItems;
  const unreadCount = currentUser ? getUnreadCount(currentUser.id) : 0;

  const currentDivision = currentUser
    ? (() => {
        const divisionValue = currentUser.division;
        if (!divisionValue) return 'FAD';
        const divisionCode = typeof divisionValue === 'string'
          ? divisionValue
          : (divisionValue as any)?.code ?? '';
        const foundDivision = DIVISIONS.find(d => d.code === divisionCode);
        return foundDivision?.name || (typeof divisionValue === 'string' ? divisionValue : divisionCode || 'FAD');
      })()
    : 'FAD';

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return isAdmin ? 'Admin Dashboard' : 'My Dashboard';
    if (path.includes('/templates')) return path.includes('/new') ? 'New Template' : path.includes('/edit') ? 'Edit Template' : 'Report Templates';
    if (path.includes('/submissions')) return 'Submissions Monitor';
    if (path.includes('/users')) return 'User Management';
    if (path.includes('/upload')) return 'Excel Import';
    if (path.includes('/reports')) return 'My Reports';
    return 'DSRTRS';
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 flex flex-col w-60 bg-[#0f172a] transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <div className="text-white text-sm truncate">DSRTRS</div>
            <div className="text-blue-400 text-xs">Division: {currentDivision}</div>
          </div>
          <button className="ml-auto lg:hidden text-white/60 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Role badge */}
        <div className="px-4 py-3 border-b border-white/10">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs ${isAdmin ? 'bg-indigo-500/20 text-indigo-300' : 'bg-green-500/20 text-green-300'}`}>
            {isAdmin ? <Shield className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
            {isAdmin ? 'Administrator' : 'Staff / User'}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="px-3 pb-2 text-xs text-white/30 uppercase tracking-wider">Navigation</p>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/20'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User profile */}
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs shrink-0">
              {currentUser?.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="text-white text-sm truncate">{currentUser?.name}</div>
              <div className="text-white/40 text-xs">{currentUser?.office}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center px-4 lg:px-6 gap-4 shrink-0">
          <button
            className="lg:hidden text-gray-500 hover:text-gray-700"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="text-gray-800">{getPageTitle()}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {/* Notification bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(p => !p)}
                className="relative w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center leading-none">
                    {unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
            </div>

            {/* User avatar */}
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm">
              {currentUser?.name.charAt(0)}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

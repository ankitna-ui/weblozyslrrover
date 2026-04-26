import { ArrowLeftRight, Download, Menu, Share2, User } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';

export default function TopBar() {
  const { isLoggedIn, userRole, assignedMultiZone, assignedZone, assignedDistrict, roverId, setShowModal, logout } = useAuth();

  return (
    <div className="fixed top-0 left-0 right-0 h-14 z-40 px-4 lg:px-8 border-b transition-colors flex items-center justify-between no-print"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border-color)' }}>
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-white flex items-center justify-center overflow-hidden border border-[var(--border-color)]">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvVujcaztP-Ta_XV1QUQF5n0nU_2sy_-MyLA&s"
            alt="Weblozy Logo"
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="font-display font-semibold text-sm leading-tight hidden sm:block"
              style={{ color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
              TELANGANA S&LR
            </h1>
            <span className="bg-black text-white text-[9px] px-1.5 py-0.5 rounded-sm font-mono-data font-bold hidden sm:inline-block">WEBLOZY</span>
          </div>
          <p className="font-mono-data text-[10px] uppercase hidden sm:block"
            style={{ color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
            Pts Rover Protocol
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Active Rover Display */}
        {isLoggedIn && roverId && (
          <Link to="/workspace" className="hidden md:flex font-mono-data text-xs px-3 py-1.5 rounded items-center gap-2 hover:bg-[var(--primary-cyan)]/10 transition-colors"
            style={{ backgroundColor: 'var(--void)', border: '1px solid var(--border-color)', color: 'var(--primary-cyan)' }}>
            <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ backgroundColor: 'var(--primary-cyan)' }} />
            WORKING ON: {roverId}
          </Link>
        )}

        {/* Global actions */}
        <div className="hidden sm:flex items-center" style={{ color: 'var(--text-secondary)' }}>
          <button className="p-2 transition-colors hover:text-[var(--primary-cyan)]" title="Export Daily Roster">
            <Download className="w-4 h-4" />
          </button>
          <button className="p-2 transition-colors hover:text-[var(--primary-cyan)]" title="Share View">
            <Share2 className="w-4 h-4" />
          </button>
          <button className="p-2 transition-colors hover:text-[var(--primary-cyan)]" title="System Logs">
            <ArrowLeftRight className="w-4 h-4" />
          </button>
        </div>

        <div className="w-[1px] h-4 mx-2" style={{ backgroundColor: 'var(--border-color)' }} />

        {/* Auth Buttons */}
        {!isLoggedIn ? (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded font-mono-data text-xs font-medium uppercase tracking-wider transition-colors"
            style={{ backgroundColor: 'var(--primary-cyan)', color: 'white' }}
          >
            <User className="w-3.5 h-3.5" />
            Login
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end mr-2">
              <span className="font-mono-data text-[10px] font-bold" style={{ color: 'var(--primary-cyan)' }}>
                {userRole === 'LEVEL1' ? 'L1 HOD' : userRole === 'LEVEL2' ? 'L2 HOD' : userRole === 'LEVEL3' ? 'L3 HOD' : 'ADMIN'}
              </span>
              <span className="font-mono-data text-[8px] uppercase opacity-60" style={{ color: 'var(--text-primary)' }}>
                {userRole === 'LEVEL1' ? `MZ ${assignedMultiZone}` : 
                 userRole === 'LEVEL2' ? `ZONE ${assignedZone}` : 
                 userRole === 'LEVEL3' ? assignedDistrict : 
                 'STATE ACCESS'}
              </span>
            </div>
            <button
              onClick={() => {
                logout();
                window.location.href = '/';
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded font-mono-data text-xs font-medium uppercase tracking-wider transition-colors hover:bg-red-500/10"
              style={{ border: '1px solid var(--danger)', color: 'var(--danger)', backgroundColor: 'transparent' }}
            >
              Logout
            </button>
          </div>
        )}

        <ThemeToggle />

        {/* Mobile menu */}
        <button className="sm:hidden p-2" style={{ color: 'var(--text-secondary)' }}>
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

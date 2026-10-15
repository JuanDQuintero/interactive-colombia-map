import React, { useEffect, useRef } from 'react';
import type { User } from 'firebase/auth';
import defaultAvatar from '../../assets/default-avatar.jpg';
import { useTheme } from '../../context/ThemeContext';

interface UserDropdownProps {
  onLogout: () => void;
  onClose: () => void;
  openUp?: boolean;
  user?: User | null;
  triggerRef?: React.RefObject<HTMLElement | null>;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ onLogout, onClose, openUp = false, user = null, triggerRef }) => {
  const { theme, toggleTheme } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const insideTrigger = triggerRef?.current?.contains(target) ?? false;
      if (dropdownRef.current && !dropdownRef.current.contains(target) && !insideTrigger) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose, triggerRef]);

  return (
    <div
      ref={dropdownRef}
      className={`absolute right-0 z-20 w-56 max-w-[calc(100vw-2rem)] bg-panel border border-rule rounded-md shadow-lg overflow-hidden ${openUp ? 'bottom-full mb-2' : 'top-full mt-2'}`}
    >
      {user && (
        <div className="flex items-center gap-3 bg-paper-deep border-b border-rule-soft px-4 py-3">
          <img
            src={user.photoURL ?? defaultAvatar}
            alt=""
            className="w-9 h-9 rounded-full object-cover ring-1 ring-rule shrink-0"
          />
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink truncate">{user.displayName ?? 'Mi cuenta'}</p>
            {user.email && <p className="text-xs text-ink-faint truncate">{user.email}</p>}
          </div>
        </div>
      )}

      <div className="py-1">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm text-ink hover:bg-paper-deep transition-colors"
        >
          {theme === 'light' ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
          )}
          <span>{theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}</span>
        </button>

        <div className="border-t border-rule-soft" />

        <button
          type="button"
          onClick={onLogout}
          className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm text-clay hover:bg-clay hover:text-paper transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};

export default UserDropdown;

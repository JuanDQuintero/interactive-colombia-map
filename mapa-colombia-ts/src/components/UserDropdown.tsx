import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface UserDropdownProps {
  onLogout: () => void;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ onLogout }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-md shadow-xl z-20 ring-1 ring-black ring-opacity-5 dark:bg-gray-800 dark:ring-gray-700">
      <div className="py-1">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            toggleTheme();
          }}
          className="flex items-center justify-between gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors rounded-md m-1"
        >
          <span>{theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}</span>
          {theme === 'light' ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
          )}
        </a>

        <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>

        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onLogout();
          }}
          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-red-500 hover:text-white dark:text-gray-300 dark:hover:text-white transition-colors rounded-md m-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Cerrar Sesión
        </a>
      </div>
    </div>
  );
};

export default UserDropdown;
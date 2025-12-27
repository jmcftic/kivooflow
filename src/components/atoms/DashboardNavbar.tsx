import React from 'react';
import NotificationBell from '../molecules/NotificationBell';
import LanguageSelector from './LanguageSelector';

interface DashboardNavbarProps {
  className?: string;
  title?: string;
  rightAction?: React.ReactNode;
  showNotifications?: boolean;
}

const DashboardNavbar: React.FC<DashboardNavbarProps> = ({ 
  className = "", 
  title = "Dashboard", 
  rightAction,
  showNotifications = true 
}) => {
  return (
    <nav className={`w-full bg-transparent relative z-50 ${className}`}>
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        {/* Page Title - Left */}
        <div className="flex-shrink-0 flex items-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#FFF100] leading-none">
            {title}
          </h1>
        </div>
        
        {/* Right Side - Language Selector, Notifications and Optional Actions */}
        <div className="flex-shrink-0 flex items-center gap-3">
          {/* Language Selector */}
          <div className="flex items-center">
            <LanguageSelector />
          </div>
          
          {/* Notification Bell - Always at the same height as title */}
          {showNotifications && (
            <div className="flex items-center">
              <NotificationBell />
            </div>
          )}
          
          {/* Right Action - Optional */}
          {rightAction && (
            <div className="flex-shrink-0 flex items-center">
              {rightAction}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;

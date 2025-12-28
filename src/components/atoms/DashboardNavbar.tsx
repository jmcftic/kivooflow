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
    <>
      {/* Iconos en pantallas pequeñas/medianas - a la altura del icono de 3 barras (top-4) */}
      {/* Estos iconos se mueven con el scroll, no son fijos */}
      <div className="lg:hidden absolute top-4 right-4 z-[60] flex items-center gap-3 pointer-events-auto">
        {/* Language Selector */}
        <div className="flex items-center">
          <LanguageSelector />
        </div>
        
        {/* Notification Bell */}
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

      {/* Navbar normal - visible en pantallas grandes */}
      <nav className={`w-full bg-transparent relative z-50 hidden lg:block ${className}`}>
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

      {/* Título solo en pantallas pequeñas/medianas - sin los iconos */}
      <div className="lg:hidden w-full bg-transparent relative z-40">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 pt-16">
          {/* Page Title - Left */}
          <div className="flex-shrink-0 flex items-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#FFF100] leading-none">
              {title}
            </h1>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardNavbar;

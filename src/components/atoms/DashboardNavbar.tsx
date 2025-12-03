import React from 'react';

interface DashboardNavbarProps {
  className?: string;
  title?: string;
  rightAction?: React.ReactNode;
}

const DashboardNavbar: React.FC<DashboardNavbarProps> = ({ className = "", title = "Dashboard", rightAction }) => {
  return (
    <nav className={`w-full bg-transparent relative z-50 ${className}`}>
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        {/* Page Title - Left */}
        <div className="flex-shrink-0 flex items-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#FFF100] leading-none">
            {title}
          </h1>
        </div>
        
        {/* Right Action - Optional */}
        {rightAction && (
          <div className="flex-shrink-0 flex items-center">
            {rightAction}
          </div>
        )}
      </div>
    </nav>
  );
};

export default DashboardNavbar;

import React from 'react';

interface DashboardNavbarProps {
  className?: string;
  title?: string;
}

const DashboardNavbar: React.FC<DashboardNavbarProps> = ({ className = "", title = "Dashboard" }) => {
  return (
    <nav className={`w-full bg-transparent relative z-50 ${className}`}>
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        {/* Page Title - Left */}
        <div className="flex-shrink-0">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#FFF100]">
            {title}
          </h1>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;

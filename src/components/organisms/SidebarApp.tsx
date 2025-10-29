import React, { useState } from 'react';
import Logo from '../atoms/Logo';
import LogoMini from '../atoms/LogoMini';
import SidebarNavigation from '../molecules/SidebarNavigation';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { MenuIcon } from 'lucide-react';

interface SidebarAppProps {
  className?: string;
}

const SidebarApp: React.FC<SidebarAppProps> = ({ className = "" }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleMouseEnter = () => {
    setIsCollapsed(false);
  };

  const handleMouseLeave = () => {
    setIsCollapsed(true);
  };

  // Contenido del sidebar (reutilizable para desktop y mobile)
  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={`h-full flex flex-col ${isMobile ? 'bg-[#212020]' : ''}`}>
      {/* Fondo del sidebar - Solo visible cuando está expandido en desktop */}
      {!isCollapsed && !isMobile && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute bottom-[-64.89%] left-0 right-0 top-0">
            <img
              alt=""
              className="block max-w-none size-full object-cover"
              height="1688.528"
              src="/SidebarBg.png"
              width="284"
            />
          </div>
        </div>
      )}
      
      {/* Fondo móvil */}
      {isMobile && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute bottom-[-64.89%] left-0 right-0 top-0">
            <img
              alt=""
              className="block max-w-none size-full object-cover"
              height="1688.528"
              src="/SidebarBg.png"
              width="284"
            />
          </div>
        </div>
      )}
      
      {/* Logo Kivoo */}
      <div className="pt-6.5 px-6 flex justify-center relative z-60">
        {isCollapsed && !isMobile ? (
          <LogoMini />
        ) : (
          <Logo width={180} height={25} />
        )}
      </div>
      
      {/* Contenido del sidebar */}
      <div className="mt-8 px-6 relative z-60 flex-1 flex flex-col">
        <div className="flex-1">
          <SidebarNavigation isCollapsed={isCollapsed && !isMobile} />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar (Sheet/Drawer) */}
      <div className="lg:hidden">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="fixed top-4 left-4 z-50 lg:hidden"
            >
              <MenuIcon className="h-6 w-6 text-white" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[284px] p-0">
            <SidebarContent isMobile={true} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar (Collapsible) */}
      <div 
        className={`hidden lg:block ${isCollapsed ? 'w-[80px] bg-[#212020]' : 'w-[284px]'} h-screen flex-none order-0 flex-grow-0 z-50 relative transition-all duration-300 ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <SidebarContent isMobile={false} />
      </div>
    </>
  );
};

export default SidebarApp;


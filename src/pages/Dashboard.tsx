import React from 'react';
import VectorPattern from '../components/atoms/VectorPattern';
import Ki6SvgIcon from '../components/atoms/Ki6SvgIcon';
import Logo from '../components/atoms/Logo';
import Sidebar from '../components/atoms/Sidebar';
import DashboardNavbar from '../components/atoms/DashboardNavbar';

const Dashboard: React.FC = () => {
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen w-full bg-[#2a2a2a] relative flex flex-col lg:flex-row">
      {/* Sidebar - Hidden on mobile, visible on desktop */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      
      {/* Contenido principal */}
      <div className="flex-1 relative flex flex-col">
        {/* Navbar responsivo */}
        <DashboardNavbar />
        
        {/* Contenido principal centrado */}
        <div className="flex flex-col items-center justify-center flex-1 relative z-20 px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl w-full">
            <p className="text-xl sm:text-2xl text-gray-300 mb-8">
              ¡Bienvenido a Kivoo!
            </p>
            <div className="bg-gray-800 rounded-lg p-4 sm:p-6 max-w-md mx-auto">
              <h2 className="text-lg font-semibold text-[#FFF100] mb-4">
                Funcionalidades disponibles:
              </h2>
              <ul className="text-gray-300 space-y-2 text-sm sm:text-base">
                <li>• Gestión de tarjetas</li>
                <li>• Historial de transacciones</li>
                <li>• Configuración de perfil</li>
                <li>• Sistema de referidos</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* SVG de esquina en inferior derecha (debajo del patrón) */}
        <div className="absolute bottom-0 right-0 pointer-events-none overflow-hidden z-0">
          <Ki6SvgIcon 
            width={2850.92} 
            height={940.08} 
            rotation={0}
            className="w-[80vw] sm:w-[60vw] lg:w-[50vw] h-auto border-0 outline-none" 
          />
        </div>

        {/* Patrón de vectores SVG (encima de la esquina) */}
        <VectorPattern className="z-10" />
      </div>
    </div>
  );
};

export default Dashboard;

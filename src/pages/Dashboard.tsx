import React from 'react';
import VectorPattern from '../components/atoms/VectorPattern';
import Ki6SvgIcon from '../components/atoms/Ki6SvgIcon';
import Logo from '../components/atoms/Logo';
import LogoutButton from '../components/atoms/LogoutButton';

const Dashboard: React.FC = () => {
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <div className="h-screen w-full bg-[#2a2a2a] relative">
      {/* Header con logo y botón de logout */}
      <div className="relative z-20 pt-8 px-8 flex justify-between items-center">
        <div className="flex-1"></div> {/* Espaciador izquierdo */}
        <Logo width={212} height={29} />
        <div className="flex-1 flex justify-end"> {/* Espaciador derecho con botón */}
          <LogoutButton />
        </div>
      </div>
      
      {/* Contenido principal centrado */}
      <div className="flex flex-col items-center justify-center h-full relative z-20 -mt-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Dashboard
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            ¡Bienvenido a Kivoo!
          </p>
          <div className="bg-gray-800 rounded-lg p-6 max-w-md">
            <h2 className="text-lg font-semibold text-[#FFF100] mb-4">
              Funcionalidades disponibles:
            </h2>
            <ul className="text-gray-300 space-y-2">
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
          className="w-[80vw] h-auto border-0 outline-none" 
        />
      </div>

      {/* Patrón de vectores SVG (encima de la esquina) */}
      <VectorPattern className="z-10" />
    </div>
  );
};

export default Dashboard;

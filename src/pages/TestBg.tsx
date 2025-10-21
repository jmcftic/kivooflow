import React from 'react';
import KivoMainBg from '../components/atoms/KivoMainBg';
import Ki6SvgIcon from '../components/atoms/Ki6SvgIcon';
import Logo from '../components/atoms/Logo';

const TestBg: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-[#2a2a2a] relative flex flex-col">
      {/* Nuevo fondo SVG */}
      <KivoMainBg className="absolute inset-0 z-0" />

      {/* Logo en la parte superior */}
      <div className="relative z-10 pt-8 flex justify-center">
        <Logo width={212} height={40} />
      </div>
      
      {/* Contenido principal centrado */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold text-white mb-8 text-center">
          TEST BG
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 text-center max-w-2xl px-4">
          Página de prueba para visualizar el nuevo fondo KivoMainBg.svg con el vector de esquina
        </p>
      </div>

      {/* Vector de esquina en inferior derecha */}
      <div className="absolute bottom-0 right-0 pointer-events-none overflow-hidden z-0">
        <Ki6SvgIcon
          width={2850.92}
          height={940.08}
          rotation={0}
          className="w-[80vw] sm:w-[60vw] lg:w-[50vw] h-auto border-0 outline-none"
        />
      </div>
    </div>
  );
};

export default TestBg;
